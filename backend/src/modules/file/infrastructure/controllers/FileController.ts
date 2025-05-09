import { FastifyRequest, FastifyReply } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import { CustomError } from "@shared/customError";
import { OngParams, ActionParams, DeleteParams } from "@routeParams/RouteParams";
import { UploadOngFileService, 
         UploadActionFileService, 
         DeleteFileService, 
         GetActionFilesByCategoryService, 
         GetOngFilesByCategoryService
       } from "@modules/file";
import { logService } from "@config/dependencysInjection/logDependencyInjection";
import { GetActionService } from "@modules/action";

interface CustomMultipartFile extends MultipartFile {
  size: number;
}

class FileController {
  private uploadOngFileService: UploadOngFileService;
  private uploadActionFileService: UploadActionFileService;
  private deleteFileService: DeleteFileService;
  private getActionFilesByCategoryService: GetActionFilesByCategoryService;
  private getOngFilesByCategoryService: GetOngFilesByCategoryService;
  private getActionService: GetActionService

  // Construtor recebe as instâncias de serviço injetadas
  constructor(
    uploadOngFileService: UploadOngFileService,
    uploadActionFileService: UploadActionFileService,
    deleteFileService: DeleteFileService,
    getActionFilesByCategoryService: GetActionFilesByCategoryService,
    getOngFilesByCategoryService: GetOngFilesByCategoryService,
    getActionService: GetActionService
  ) {
    this.uploadOngFileService = uploadOngFileService;
    this.uploadActionFileService = uploadActionFileService;
    this.deleteFileService = deleteFileService;
    this.getActionFilesByCategoryService = getActionFilesByCategoryService;
    this.getOngFilesByCategoryService = getOngFilesByCategoryService;
    this.getActionService = getActionService;
  }

  private validateFileRequest(reply: FastifyReply, fileBuffer: Buffer | null, category: string, user: any): boolean {
    if (!fileBuffer) {
      reply.status(400).send({ error: "Nenhum arquivo enviado" });
      return false;
    }
  
    if (!category) {
      reply.status(400).send({ error: "Categoria do arquivo é obrigatória" });
      return false;
    }
  
    if (!user || !user.ngoId) {
      reply.status(401).send({ error: "Usuário não autenticado ou sem permissão" });
      return false;
    }
  
    return true;
  }

  private async extractFileData(request: FastifyRequest) {
    const parts = request.parts();
    let fileBuffer: Buffer | null = null;
    let filename = '';
    let mimetype = '';
    let size = 0;
    let category = '';
  
    for await (const part of parts) {
      if (part.type === 'file') {
        const filePart = part as CustomMultipartFile;
        fileBuffer = await filePart.toBuffer();
        filename = filePart.filename;
        mimetype = filePart.mimetype;
        size = filePart.file.bytesRead;
      } else if (part.type === 'field' && part.fieldname === 'category') {
        category = part.value as string;
      }
    }
  
    return { fileBuffer, filename, mimetype, size, category };
  }

  // Helper para converter a categoria em formato de caminho para cache
  getCacheCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'image': 'images',
      'video': 'videos',
      'report': 'reports',
      'tax invoice': 'tax_invoices',
      'other': 'others'
    };
    
    return categoryMap[category] || category;
  }

  async uploadOngFile(request: any, reply: any) {
    try {
      const { fileBuffer, filename, mimetype, size, category } = await this.extractFileData(request);

      if (!fileBuffer) {
        throw new CustomError("Nenhum arquivo enviado", 400);
      }
    
      if (!category) {
        throw new CustomError("Categoria do arquivo é obrigatória", 400);
      }
    
      if (!request.user || !request.user.ngoId) {
        throw new CustomError("Usuário não autenticado ou sem permissão", 401);
      }
  
      const fileEntity = await this.uploadOngFileService.execute(fileBuffer, filename, category, mimetype, size, request.user.ngoId);
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "CRIAR", "Arquivo", fileEntity.id, { filename, category, mimetype, size }, `Arquivo "${filename}" da ONG criado`);
      
      // Don't send response here, let the route handler do it
      return fileEntity;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      
      // Tratar o erro no próprio controller
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: 'Erro ao fazer upload do arquivo' });
      }
      
      // Re-lançar para o handler da rota saber que houve um erro
      throw error;
    }
  }

  async uploadActionFile(request: FastifyRequest<{ Params: ActionParams }>) {
    const { fileBuffer, filename, mimetype, size, category } = await this.extractFileData(request);

    if (!fileBuffer) {
      throw new CustomError("Nenhum arquivo enviado", 400);
    }
  
    if (!category) {
      throw new CustomError("Categoria do arquivo é obrigatória", 400);
    }
  
    if (!request.user || !request.user.ngoId) {
      throw new CustomError("Usuário não autenticado ou sem permissão", 401);
    }

    const fileEntity = await this.uploadActionFileService.execute(fileBuffer, filename, category, mimetype, size, request.params.actionId, request.user.ngoId);

    // Buscar o nome da ação
    let actionName = "desconhecida";
    try {
      const action = await this.getActionService.executeById(request.params.actionId);
      if (action) actionName = action.name;
    } catch (error) {
      console.error("Erro ao buscar nome da ação:", error);
    }

    await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "CRIAR", "Arquivo", fileEntity.id, { filename, category, mimetype, size }, `Arquivo "${filename}" criado para ação "${actionName}"`);
    
    // Don't send response here, let the route handler do it
    return fileEntity;
  }

  async delete(request: FastifyRequest<{ Params: DeleteParams }>, model: string) {
    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const { id } = request.params;

    const deleteResult = await this.deleteFileService.execute(id);

    if (model == 'action' && deleteResult.actionId) {
      let actionName = "desconhecida";
      
      const action = await this.getActionService.executeById(deleteResult.actionId);
      if (action) actionName = action.name;
      
      await logService.logAction(
        request.user.ngoId, 
        request.user.id, 
        request.user.name, 
        "DELETAR", 
        "Arquivo", 
        id, 
        { 
          name: deleteResult.name, 
          category: deleteResult.category, 
          actionName: action
        }, 
        `Arquivo "${deleteResult.name}" deletado da ação "${actionName}"`
      );
        
    } else if (model == 'ong') {
      await logService.logAction(
        request.user.ngoId, 
        request.user.id, 
        request.user.name, 
        "DELETAR", 
        "Arquivo", 
        id, 
        { 
          name: deleteResult.name, 
          category: deleteResult.category 
        }, 
        `Arquivo "${deleteResult.name}" deletado da ong`
      );
    }

    // Don't send response here, let the route handler do it
    return deleteResult;
  }

  async getActionFilesByCategory(request: FastifyRequest<{ Params: ActionParams }>, reply: FastifyReply, category: string) {
    const { actionId } = request.params;

    try {
      const files = await this.getActionFilesByCategoryService.execute(actionId, category);
      reply.send(files);
    } catch (error) {
      console.error(`Erro ao buscar arquivos da categoria ${category}:`, error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: `Erro interno ao buscar arquivos da categoria ${category}` });
      }
    }
  }

  async getOngFilesByCategory(request: FastifyRequest<{ Params: OngParams }>, reply: FastifyReply, category: string) {
    const { ngoId } = request.params;

    try {
      const files = await this.getOngFilesByCategoryService.execute(ngoId, category);
      reply.send(files);
    } catch (error) {
      console.error(`Erro ao buscar arquivos da categoria ${category}:`, error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: `Erro interno ao buscar arquivos da categoria ${category}` });
      }
    }
  }

  // Métodos para buscar diferentes tipos de arquivos
  async getActionImages(request: FastifyRequest<{ Params: ActionParams }>, reply: FastifyReply) {
    return this.getActionFilesByCategory(request, reply, 'image');
  }

  async getActionVideos(request: FastifyRequest<{ Params: ActionParams }>, reply: FastifyReply) {
    return this.getActionFilesByCategory(request, reply, 'video');
  }

  async getActionReportFiles(request: FastifyRequest<{ Params: ActionParams }>, reply: FastifyReply) {
    return this.getActionFilesByCategory(request, reply, 'report');
  }

  async getActionTaxInvoicesFiles(request: FastifyRequest<{ Params: ActionParams }>, reply: FastifyReply) {
    return this.getActionFilesByCategory(request, reply, 'tax invoice');
  }

  async getActionOtherFiles(request: FastifyRequest<{ Params: ActionParams }>, reply: FastifyReply) {
    return this.getActionFilesByCategory(request, reply, 'other');
  }

  async getOngImages(request: FastifyRequest<{ Params: OngParams }>, reply: FastifyReply) {
    return this.getOngFilesByCategory(request, reply, 'image');
  }

  async getOngVideos(request: FastifyRequest<{ Params: OngParams }>, reply: FastifyReply) {
    return this.getOngFilesByCategory(request, reply, 'video');
  }

  async getOngReportFiles(request: FastifyRequest<{ Params: OngParams }>, reply: FastifyReply) {
    return this.getOngFilesByCategory(request, reply, 'report');
  }

  async getOngTaxInvoicesFiles(request: FastifyRequest<{ Params: OngParams }>, reply: FastifyReply) {
    return this.getOngFilesByCategory(request, reply, 'tax invoice');
  }

  async getOngOtherFiles(request: FastifyRequest<{ Params: OngParams }>, reply: FastifyReply) {
    return this.getOngFilesByCategory(request, reply, 'other');
  }
}

export { FileController };