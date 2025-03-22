import { FileRepository } from "@modules/file";
import { CustomError } from "@shared/customError";
import s3StorageInstance from "@shared/s3Cliente";

class CreateFileAwsService {
  private fileRepository: FileRepository;
  
  // Usar injeção de dependência em vez de criar nova instância
  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
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
      // Este método já está correto, pois deleteFileFromS3 processa corretamente URLs completas
      await this.fileRepository.deleteFileFromS3(filename);
    } catch (error) {
      console.error("Erro ao deletar arquivo no AWS service:", error);
      throw new CustomError("Erro ao deletar arquivo no AWS service", 500);
    }
  }
  
  // Adicionar método para excluir pasta inteira
  async deleteEntityFolder(type: 'ong' | 'action' | 'user', entityId: string | number, ngoId: number): Promise<number> {
    try {
      return await this.fileRepository.deleteEntityFiles(type, entityId, ngoId);
    } catch (error) {
      console.error(`Erro ao excluir pasta de ${type}:`, error);
      throw new CustomError(`Erro ao excluir pasta de ${type}`, 500);
    }
  }
}

export { CreateFileAwsService };