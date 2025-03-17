import { FileRepository } from "@modules/file";

class DeleteFileService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }
}

export { DeleteFileService };