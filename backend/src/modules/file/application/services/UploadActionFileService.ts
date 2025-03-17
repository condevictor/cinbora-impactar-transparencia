import { FileRepository, ActionFileEntity, ActionFileProps } from "@modules/file";

class UploadActionFileService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(fileBuffer: Buffer, fileName: string, category: string, mimeType: string, size: number, actionId: string, ngoId: number): Promise<ActionFileEntity> {
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
  }
}

export { UploadActionFileService };