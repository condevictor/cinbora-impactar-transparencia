import { FileRepository } from "@modules/file";
import { CustomError } from "@shared/customError";

class CreateFileAwsService {
  private fileRepository: FileRepository;

  constructor() {
    this.fileRepository = new FileRepository();
  }

  async uploadActionImage(fileBuffer: Buffer, filename: string, ngoId?: number, actionId?: string): Promise<string> {
    try {
      return await this.fileRepository.saveFile(fileBuffer, filename, ngoId, actionId);
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo no AWS service:", error);
      throw new CustomError("Erro ao fazer upload do arquivo no AWS service", 500);
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      await this.fileRepository.deleteFileFromS3(filename);
    } catch (error) {
      console.error("Erro ao deletar arquivo no AWS service:", error);
      throw new CustomError("Erro ao deletar arquivo no AWS service", 500);
    }
  }
}

export { CreateFileAwsService };