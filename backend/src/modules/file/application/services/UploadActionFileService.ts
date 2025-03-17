import { FileRepository, ActionFileEntity, ActionFileProps } from "@modules/file";
import { CustomError } from "@shared/customError";

class UploadActionFileService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(fileBuffer: Buffer, fileName: string, category: string, mimeType: string, size: number, actionId: string, ngoId: number): Promise<ActionFileEntity> {
    try {
      const fileProps: ActionFileProps = {
        name: fileName,
        aws_name: '',
        category,
        aws_url: '',
        actionId,
        ngoId,
        mime_type: mimeType,
        size,
      };
      return this.fileRepository.createActionFile(fileBuffer, fileProps);
    } catch (error) {
      console.error("Erro no serviço de upload do arquivo da ação:", error);
      throw new CustomError("Erro no serviço de upload do arquivo da ação", 500);
    }
  }
}

export { UploadActionFileService };