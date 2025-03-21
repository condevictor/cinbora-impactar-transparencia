import { FileRepository } from "@modules/file";
import { CustomError } from "@shared/customError";

class DeleteFileService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(id: string): Promise<{ category: string }> {
    try {
      const deleteResult = await this.fileRepository.delete(id);
      return deleteResult;
    } catch (error) {
      console.error("Erro no serviço de deletar arquivo:", error);
      throw new CustomError("Erro no serviço de deletar arquivo", 500);
    }
  }
}

export { DeleteFileService };