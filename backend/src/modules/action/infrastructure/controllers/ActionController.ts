import { FastifyRequest, FastifyReply } from "fastify";
import { CreateActionService, DeleteActionService, GetActionService, UpdateActionService, UpdateActionExpensesGraficService, ActionProps } from "@modules/action";
import { CreateFileAwsService } from "@modules/file";
import { logService } from "@config/dependencysInjection/logDependencyInjection";
import { MultipartFile } from "@fastify/multipart";
import { CustomError } from "@shared/customError";

interface CustomMultipartFile extends MultipartFile {
  size: number;
}

class ActionController {
  private getActionService: GetActionService;
  private createActionService: CreateActionService;
  private updateActionService: UpdateActionService;
  private deleteActionService: DeleteActionService;
  private updateActionExpensesGraficService: UpdateActionExpensesGraficService;
  private createFileAwsService: CreateFileAwsService;

  constructor(
    getActionService: GetActionService,
    createActionService: CreateActionService,
    updateActionService: UpdateActionService,
    deleteActionService: DeleteActionService,
    updateActionExpensesGraficService: UpdateActionExpensesGraficService
  ) {
    this.getActionService = getActionService;
    this.createActionService = createActionService;
    this.updateActionService = updateActionService;
    this.deleteActionService = deleteActionService;
    this.updateActionExpensesGraficService = updateActionExpensesGraficService;
    this.createFileAwsService = new CreateFileAwsService();
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId } = request.params as { id: string };
    try {
      const actions = await this.getActionService.executeByNgoId(ngoId);
      reply.send(actions);
    } catch (error) {
      console.error("Erro ao obter Ações:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao obter Ações" });
      }
    }
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId, actionId } = request.params as { id: string, actionId: string };
    try {
      const action = await this.getActionService.executeByNgoIdAndActionId(ngoId, actionId);
      if (!action) {
        reply.status(404).send({ error: "Ação não encontrada" });
        return;
      }
      reply.send(action);
    } catch (error) {
      console.error("Erro ao obter Ação:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao obter Ação" });
      }
    }
  }

  async getOneWithExpenses(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId, actionId } = request.params as { id: string, actionId: string };
    try {
      const action = await this.getActionService.executeByNgoIdAndActionId(ngoId, actionId);
      if (!action) {
        reply.status(404).send({ error: "Ação não encontrada" });
        return;
      }
      const ngoExpensesGrafic = await this.getActionService.getExpensesByActionId(actionId);
      reply.send({ action, ngoExpensesGrafic });
    } catch (error) {
      console.error("Erro ao obter Ação:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao obter Ação" });
      }
    }
  }

  async updateActionExpensesGrafic(request: FastifyRequest, reply: FastifyReply) {
    const { actionId } = request.params as { actionId: string };
    const { categorysExpenses } = request.body as {
      categorysExpenses?: Record<string, number>;
    };

    if (!categorysExpenses) {
      reply.status(400).send({ error: "Dados de despesas não fornecidos" });
      return;
    }

    try {
      if (!request.user) {
        reply.status(401).send({ error: "Usuário não autenticado" });
        return;
      }
      const updatedGrafic = await this.updateActionExpensesGraficService.execute(actionId, categorysExpenses);
      await logService.logAction(request.user.id.toString(), request.user.name, "ATUALIZAR", "Gráfico de Despesas da Ação", actionId, categorysExpenses, "Gráfico de despesas da ação atualizado");
      reply.send(updatedGrafic);
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao atualizar gráfico de despesas da ação" });
      }
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const parts = request.parts();
    let name = '';
    let type = '';
    let spent = 0;
    let goal = 0;
    let colected = 0;
    let fileBuffer: Buffer | null = null;
    let filename = '';
    let mimetype = '';
    let size = 0;

    for await (const part of parts) {
      if (part.type === 'file') {
        const filePart = part as CustomMultipartFile;
        fileBuffer = await filePart.toBuffer();
        filename = filePart.filename;
        mimetype = filePart.mimetype;
        size = filePart.file.bytesRead;
      } else if (part.type === 'field') {
        const fieldPart = part as { fieldname: string, value: string };
        if (fieldPart.fieldname === 'name') name = fieldPart.value;
        if (fieldPart.fieldname === 'type') type = fieldPart.value;
        if (fieldPart.fieldname === 'spent') spent = parseFloat(fieldPart.value);
        if (fieldPart.fieldname === 'goal') goal = parseFloat(fieldPart.value);
        if (fieldPart.fieldname === 'colected') colected = parseFloat(fieldPart.value);
      }
    }

    if (!fileBuffer) {
      reply.status(400).send({ error: "No file uploaded" });
      return;
    }

    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    try {
      const aws_url = await this.createFileAwsService.uploadFile(fileBuffer, filename);

      const action = await this.createActionService.execute({
        name,
        type,
        ngoId: request.user.ngoId,
        spent,
        goal,
        colected,
        aws_url,
      });

      await logService.logAction(request.user.id.toString(), request.user.name, "CRIAR", "Ação", action.id.toString(), { name, type, spent, goal, colected, aws_url }, "Ação criada");
      reply.send(action);
    } catch (error) {
      console.error("Error creating action:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao criar ação" });
      }
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<ActionProps>;

    try {
      if (!request.user) {
        reply.status(401).send({ error: "Usuário não autenticado" });
        return;
      }
      const updatedAction = await this.updateActionService.execute(id, data);
      await logService.logAction(request.user.id.toString(), request.user.name, "ATUALIZAR", "Ação", id, data, "Ação atualizada");
      reply.send(updatedAction);
    } catch (error) {
      console.error("Error updating action:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao atualizar ação" });
      }
    }
  }

  async updateActionImage(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const parts = request.parts();
    let fileBuffer: Buffer | null = null;
    let filename = '';

    for await (const part of parts) {
      if (part.type === 'file') {
        const filePart = part as CustomMultipartFile;
        fileBuffer = await filePart.toBuffer();
        filename = filePart.filename;
      }
    }

    if (!fileBuffer) {
      reply.status(400).send({ error: "No file uploaded" });
      return;
    }

    try {
      if (!request.user) {
        reply.status(401).send({ error: "Usuário não autenticado" });
        return;
      }
      const action = await this.getActionService.executeById(id);
      if (!action) {
        reply.status(404).send({ error: "Ação não encontrada" });
        return;
      }

      const oldFileName = action.aws_url.split('/').pop();
      if (oldFileName) {
        await this.createFileAwsService.deleteFile(oldFileName);
      }

      const aws_url = await this.createFileAwsService.uploadFile(fileBuffer, filename);
      const updatedAction = await this.updateActionService.execute(id, { aws_url });
      await logService.logAction(request.user.id.toString(), request.user.name, "ATUALIZAR", "Ação", id, { aws_url }, "Imagem da ação atualizada");

      reply.send({ message: "Imagem da ação atualizada com sucesso", aws_url: updatedAction.aws_url });
    } catch (error) {
      console.error("Error updating action image:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao atualizar imagem da ação" });
      }
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    const { id } = request.params as { id: string };

    try {
      await this.deleteActionService.execute({ id });
      await logService.logAction(request.user.id.toString(), request.user.name, "DELETAR", "Ação", id, {}, "Ação deletada");
      reply.send({ message: "Ação deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting action:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao deletar ação" });
      }
    }
  }
}

export { ActionController };