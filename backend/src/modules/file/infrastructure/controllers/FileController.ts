import { FastifyRequest, FastifyReply } from "fastify";
import { uploadOngFileService, uploadActionFileService, deleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService } from "@config/dependencysInjection/fileDependencyInjection";
import { UploadOngFileService, UploadActionFileService, DeleteFileService, GetActionFilesByCategoryService, GetOngFilesByCategoryService } from "@modules/file";
import { MultipartFile } from "@fastify/multipart";

interface CustomMultipartFile extends MultipartFile {
  size: number;
}

interface ActionParams {
  actionId: string;
}

interface OngParams {
  ngoId: string;
}

interface DeleteParams {
  id: string;
}

class FileController {
  private uploadOngFileService: UploadOngFileService;
  private uploadActionFileService: UploadActionFileService;
  private deleteFileService: DeleteFileService;
  private getActionFilesByCategoryService: GetActionFilesByCategoryService;
  private getOngFilesByCategoryService: GetOngFilesByCategoryService;

  constructor() {
    this.uploadOngFileService = uploadOngFileService;
    this.uploadActionFileService = uploadActionFileService;
    this.deleteFileService = deleteFileService;
    this.getActionFilesByCategoryService = getActionFilesByCategoryService;
    this.getOngFilesByCategoryService = getOngFilesByCategoryService;
  }

  async uploadOngFile(request: FastifyRequest, reply: FastifyReply) {
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

    if (!fileBuffer) {
      reply.status(400).send({ error: "No file uploaded" });
      return;
    }

    if (!category) {
      reply.status(400).send({ error: "File category is required" });
      return;
    }

    if (!request.user) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    try {
      const fileEntity = await this.uploadOngFileService.execute(fileBuffer, filename, category, mimetype, size, request.user.ngoId);
      reply.send({ fileUrl: fileEntity.aws_url });
    } catch (error) {
      console.error("Error uploading file:", error);
      reply.status(500).send({ error: "Error uploading file" });
    }
  }

  async uploadActionFile(request: FastifyRequest<{ Params: ActionParams }>, reply: FastifyReply) {
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

    if (!fileBuffer) {
      reply.status(400).send({ error: "No file uploaded" });
      return;
    }

    if (!category) {
      reply.status(400).send({ error: "File category is required" });
      return;
    }

    if (!request.user) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    try {
      const fileEntity = await this.uploadActionFileService.execute(fileBuffer, filename, category, mimetype, size, request.params.actionId, request.user.ngoId);
      reply.send({ fileUrl: fileEntity.aws_url });
    } catch (error) {
      console.error("Error uploading file:", error);
      reply.status(500).send({ error: "Error uploading file" });
    }
  }

  async delete(request: FastifyRequest<{ Params: DeleteParams }>, reply: FastifyReply) {
    const { id } = request.params;

    try {
      await this.deleteFileService.execute(id);
      reply.send({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      reply.status(500).send({ error: "Error deleting file" });
    }
  }

  async getActionFilesByCategory(request: FastifyRequest<{ Params: ActionParams }>, reply: FastifyReply, category: string) {
    const { actionId } = request.params;

    try {
      const files = await this.getActionFilesByCategoryService.execute(actionId, category);
      reply.send(files);
    } catch (error) {
      console.error(`Error fetching ${category} files:`, error);
      reply.status(500).send({ error: `Error fetching ${category} files` });
    }
  }

  async getOngFilesByCategory(request: FastifyRequest<{ Params: OngParams }>, reply: FastifyReply, category: string) {
    const { ngoId } = request.params;

    try {
      const files = await this.getOngFilesByCategoryService.execute(ngoId, category);
      reply.send(files);
    } catch (error) {
      console.error(`Error fetching ${category} files:`, error);
      reply.status(500).send({ error: `Error fetching ${category} files` });
    }
  }

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