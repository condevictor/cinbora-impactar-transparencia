import { FileRepository, OngFileEntity, OngFileProps } from "@modules/file";
import { CustomError } from "@shared/customError";

class UploadOngFileService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(fileBuffer: Buffer, fileName: string, category: string, mimeType: string, size: number, ngoId: number): Promise<OngFileEntity> {
    
    try {
      const fileProps: OngFileProps = {
        name: fileName,
        aws_name: '', 
        category,
        aws_url: '',
        ngoId,
        mime_type: mimeType,
        size,
      };
      return this.fileRepository.createOngFile(fileBuffer, fileProps);
    } catch (error) {
      console.error("Erro no serviço de upload do arquivo da ONG:", error);
      throw new CustomError("Erro no serviço de upload do arquivo da ONG", 500);
    }
  }
}

export { UploadOngFileService };