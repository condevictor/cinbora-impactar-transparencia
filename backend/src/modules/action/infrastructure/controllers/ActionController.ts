import { FastifyRequest } from "fastify";
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
    updateActionExpensesGraficService: UpdateActionExpensesGraficService,
    createFileAwsService: CreateFileAwsService 
  ) {
    this.getActionService = getActionService;
    this.createActionService = createActionService;
    this.updateActionService = updateActionService;
    this.deleteActionService = deleteActionService;
    this.updateActionExpensesGraficService = updateActionExpensesGraficService;
    this.createFileAwsService = createFileAwsService;
  }
  async getAll(request: FastifyRequest) {
    const { id: ngoId } = request.params as { id: string };
    try {
      return await this.getActionService.executeByNgoId(ngoId);
    } catch (error) {
      console.error("Erro ao obter Ações:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter Ações", 500);
    }
  }

  async getOne(request: FastifyRequest) {
    const { id: actionId } = request.params as { id: string, actionId: string };
    try {
      const action = await this.getActionService.executeById(actionId);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
      return action;
    } catch (error) {
      console.error("Erro ao obter Ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter Ação", 500);
    }
  }

  async getOneWithExpenses(request: FastifyRequest) {
    const { actionId } = request.params as { actionId: string };
    try {
      const action = await this.getActionService.executeById(actionId);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
      const actionGrafic = await this.getActionService.getExpensesByActionId(actionId);
      return { action, actionGrafic };
    } catch (error) {
      console.error("Erro ao obter Ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter Ação", 500);
    }
  }

  async updateActionExpensesGrafic(request: FastifyRequest) {
    const { actionId } = request.params as { actionId: string };
    const { categorysExpenses } = request.body as {
      categorysExpenses?: Record<string, number>;
    };

    if (!categorysExpenses) {
      throw new CustomError("Dados de despesas não fornecidos", 400);
    }

    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }
    
    try {
      const updatedGrafic = await this.updateActionExpensesGraficService.execute(actionId, categorysExpenses);
      await logService.logAction(request.user.ngoId, request.user.id.toString(), request.user.name, "ATUALIZAR", "Gráfico de Despesas da Ação", actionId, categorysExpenses, "Gráfico de despesas da ação atualizado");
      return updatedGrafic;
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }

  async getActionExpensesGrafic(request: FastifyRequest) {
    const { id: ngoId, actionId } = request.params as { id: string, actionId: string };
    try {
      return await this.getActionService.getExpensesByActionId(actionId);
    } catch (error) {
      console.error("Erro ao obter gráfico de despesas da ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter gráfico de despesas da ação", 500);
    }
  }

  async create(request: FastifyRequest) {
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
    let categorysExpenses: Record<string, number> = {};

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
        
        // Handle categorysExpenses fields
        const categoryMatch = fieldPart.fieldname.match(/^categorysExpenses\[(.*?)\]$/);
        if (categoryMatch && categoryMatch[1]) {
          const category = decodeURIComponent(categoryMatch[1].replace(/\+/g, " "));
          categorysExpenses[category] = parseFloat(fieldPart.value);
        }
      }
    }

    if (!fileBuffer) {
      throw new CustomError("No file uploaded", 400);
    }

    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    try {
      // Primeiro, crie a ação sem aws_url
      const action = await this.createActionService.execute({
        name,
        type,
        ngoId: request.user.ngoId,
        spent,
        goal,
        colected,
        aws_url: '', // Inicialmente vazio
        categorysExpenses,
      });

      // Depois, faça o upload da imagem usando a nova estrutura de pastas
      const aws_url = await this.createFileAwsService.uploadFile(
        fileBuffer, 
        filename, 
        request.user.ngoId, 
        'actions',
        action.id // ID da ação que acabou de ser criada
      );

      // Atualize a ação com a URL da imagem
      await this.updateActionService.execute(action.id.toString(), { aws_url });
      action.aws_url = aws_url;

      await logService.logAction(
        request.user.ngoId, 
        request.user.id.toString(), 
        request.user.name, 
        "CRIAR", 
        "Ação", 
        action.id.toString(), 
        { name, type, spent, goal, colected, aws_url, categorysExpenses }, 
        "Ação criada"
      );
      
      return action;
    } catch (error) {
      console.error("Error creating action:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao criar ação", 500);
    }
  }

  async update(request: FastifyRequest) {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<ActionProps>;

    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }
    
    try {
      const updatedAction = await this.updateActionService.execute(id, data);
      await logService.logAction(request.user.ngoId, request.user.id.toString(), request.user.name, "ATUALIZAR", "Ação", id, data, "Ação atualizada");
      return updatedAction;
    } catch (error) {
      console.error("Error updating action:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar ação", 500);
    }
  }

  async updateActionImage(request: FastifyRequest) {
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
      throw new CustomError("No file uploaded", 400);
    }

    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }
    
    try {
      const action = await this.getActionService.executeById(id);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }

      // Se existe uma imagem anterior, exclua-a
      if (action.aws_url) {
        try {
          await this.createFileAwsService.deleteFile(action.aws_url);
        } catch (deleteError) {
          console.error("Erro ao excluir imagem anterior:", deleteError);
          // Continua mesmo se falhar ao excluir
        }
      }

      // Fazer upload da nova imagem usando a estrutura de pastas correta
      const aws_url = await this.createFileAwsService.uploadFile(
        fileBuffer, 
        filename, 
        request.user.ngoId, 
        'actions',
        id // ID da ação sendo atualizada
      );
      
      const updatedAction = await this.updateActionService.execute(id, { aws_url });
      await logService.logAction(
        request.user.ngoId, 
        request.user.id.toString(), 
        request.user.name, 
        "ATUALIZAR", 
        "Ação", 
        id, 
        { aws_url }, 
        "Imagem da ação atualizada"
      );

      return { message: "Imagem da ação atualizada com sucesso", aws_url: updatedAction.aws_url };
    } catch (error) {
      console.error("Error updating action image:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar imagem da ação", 500);
    }
  }

  async delete(request: FastifyRequest) {
    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const { id } = request.params as { id: string };

    try {
      await this.deleteActionService.execute({ id });
      await logService.logAction(request.user.ngoId, request.user.id.toString(), request.user.name, "DELETAR", "Ação", id, {}, "Ação deletada");
      return { message: "Ação deletada com sucesso" };
    } catch (error) {
      console.error("Error deleting action:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao deletar ação", 500);
    }
  }
}

export { ActionController };