import { FileRepository, OngFileEntity } from "@modules/file";
import { CustomError } from "@shared/customError";

class GetOngFilesByCategoryService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(ngoId: string, category: string): Promise<OngFileEntity[]> {
    try {
      return await this.fileRepository.findOngFilesByCategory(ngoId, category);
    } catch (error) {
      console.error(`Erro no serviço de busca de arquivos da ONG da categoria ${category}:`, error);
      throw new CustomError(`Erro no serviço de busca de arquivos da ONG da categoria ${category}`, 500);
    }
  }
}

export { GetOngFilesByCategoryService };