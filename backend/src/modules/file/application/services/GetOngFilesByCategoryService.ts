import { FileRepository, OngFileEntity } from "@modules/file";

class GetOngFilesByCategoryService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(ngoId: string, category: string): Promise<OngFileEntity[]> {
    return this.fileRepository.findOngFilesByCategory(ngoId, category);
  }
}

export { GetOngFilesByCategoryService };