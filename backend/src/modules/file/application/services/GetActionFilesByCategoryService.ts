import { FileRepository, ActionFileEntity } from "@modules/file";

class GetActionFilesByCategoryService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(actionId: string, category: string): Promise<ActionFileEntity[]> {
    return this.fileRepository.findActionFilesByCategory(actionId, category);
  }
}

export { GetActionFilesByCategoryService };