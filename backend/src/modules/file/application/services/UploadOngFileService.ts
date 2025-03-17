import { FileRepository, OngFileEntity, OngFileProps } from "@modules/file";

class UploadOngFileService {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(fileBuffer: Buffer, fileName: string, category: string, mimeType: string, size: number, ngoId: number): Promise<OngFileEntity> {
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
  }
}

export { UploadOngFileService };