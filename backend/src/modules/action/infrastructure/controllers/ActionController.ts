import { FastifyRequest, FastifyReply } from "fastify";
import { createActionUseCase, deleteActionUseCase, getActionUseCase, updateActionUseCase, updateActionExpensesGraficUseCase } from "@config/dependencysInjection/actionDependencyInjection";
import { ActionProps, CreateActionUseCase, DeleteActionUseCase, GetActionUseCase, UpdateActionUseCase, UpdateActionExpensesGraficUseCase } from "@modules/action";
import { CreateFileAwsService } from "@modules/file";
import { MultipartFile } from "@fastify/multipart";

interface CustomMultipartFile extends MultipartFile {
  size: number;
}

class ActionController {
  private getActionUseCase: GetActionUseCase;
  private createActionUseCase: CreateActionUseCase;
  private updateActionUseCase: UpdateActionUseCase;
  private deleteActionUseCase: DeleteActionUseCase;
  private updateActionExpensesGraficUseCase: UpdateActionExpensesGraficUseCase;
  private createFileAwsService: CreateFileAwsService;

  constructor() {
    this.getActionUseCase = getActionUseCase;
    this.createActionUseCase = createActionUseCase;
    this.updateActionUseCase = updateActionUseCase;
    this.deleteActionUseCase = deleteActionUseCase;
    this.updateActionExpensesGraficUseCase = updateActionExpensesGraficUseCase;
    this.createFileAwsService = new CreateFileAwsService();
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId } = request.params as { id: string };
    try {
      const actions = await this.getActionUseCase.executeByNgoId(ngoId);
      return actions;
    } catch (error) {
      console.error("Erro ao obter Ações:", error);
      throw new Error("Erro ao obter Ações");
    }
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId, actionId } = request.params as { id: string, actionId: string };
    try {
      const action = await this.getActionUseCase.executeByNgoIdAndActionId(ngoId, actionId);
      if (!action) {
        reply.status(404).send({ error: "Ação não encontrada" });
        return;
      }
      reply.send(action);
    } catch (error) {
      console.error("Erro ao obter Ação:", error);
      reply.status(500).send({ error: "Erro ao obter Ação" });
    }
  }

  async getOneWithExpenses(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId, actionId } = request.params as { id: string, actionId: string };
    try {
        const action = await this.getActionUseCase.executeByNgoIdAndActionId(ngoId, actionId);
        if (!action) {
            reply.status(404).send({ error: "Ação não encontrada" });
            return;
        }
        const ngoExpensesGrafic = await this.getActionUseCase.getExpensesByActionId(actionId);
        reply.send({ action, ngoExpensesGrafic });
    } catch (error) {
        console.error("Erro ao obter Ação:", error);
        reply.status(500).send({ error: "Erro ao obter Ação" });
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
      // Passa o novo JSON para o use case
      const updatedGrafic = await this.updateActionExpensesGraficUseCase.execute(actionId, categorysExpenses);
      reply.send(updatedGrafic);
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      reply.status(500).send({ error: "Erro ao atualizar gráfico de despesas da ação" });
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
      // Upload the image to S3 and get the URL
      const aws_url = await this.createFileAwsService.uploadFile(fileBuffer, filename);

      // Create the action with the image URL
      const result = await this.createActionUseCase.execute({
        name,
        type,
        ngoId: request.user.ngoId,
        spent,
        goal,
        colected,
        aws_url,
      });
  
      return result;
    } catch (error) {
      console.error("Error creating action:", error);
      throw new Error("Erro ao criar ação");
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<ActionProps>;

    try {
      const updatedAction = await this.updateActionUseCase.execute(id, data);
      reply.send(updatedAction);
    } catch (error) {
      console.error("Error updating action:", error);
      reply.status(500).send({ error: "Erro ao atualizar ação" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      await this.deleteActionUseCase.execute({ id });
      reply.send({ message: "Ação deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting action:", error);
      reply.status(500).send({ error: "Erro ao deletar ação" });
    }
  }
}

export { ActionController };
