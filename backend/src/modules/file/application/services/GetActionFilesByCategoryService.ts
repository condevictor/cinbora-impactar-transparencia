import { FileRepository, ActionFileEntity } from "@modules/file";
import { CustomError } from "@shared/customError";

class GetActionFilesByCategoryService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(actionId: string, category: string): Promise<ActionFileEntity[]> {
    try {
      return await this.fileRepository.findActionFilesByCategory(actionId, category);
    } catch (error) {
      console.error(`Erro no serviço de busca de arquivos da ação da categoria ${category}:`, error);
      throw new CustomError(`Erro no serviço de busca de arquivos da ação da categoria ${category}`, 500);
    }
  }
}

export { GetActionFilesByCategoryService };