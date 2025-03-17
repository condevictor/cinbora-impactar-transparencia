import { FileRepository } from "@modules/file";

class CreateFileAwsService {
    private fileRepository: FileRepository;
  
    constructor() {
      this.fileRepository = new FileRepository();
    }
  
    async uploadFile(fileBuffer: Buffer, filename: string): Promise<string> {
      return this.fileRepository.saveFile(fileBuffer, filename);
    }
  }

  export { CreateFileAwsService };