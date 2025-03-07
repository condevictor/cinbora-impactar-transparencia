import { FileRepository } from "@modules/file";
import { OngFileEntity, OngFileProps, ActionFileEntity, ActionFileProps } from "@modules/file";

class UploadOngFileUseCase {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(fileBuffer: Buffer, fileName: string, category: string, mimeType: string, size: number, ngoId: number): Promise<OngFileEntity> {
    const fileProps: OngFileProps = {
      name: fileName,
      category,
      aws_url: '',
      ngoId,
      mime_type: mimeType,
      size,
    };

    return this.fileRepository.createOngFile(fileBuffer, fileProps);
  }
}

class UploadActionFileUseCase {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(fileBuffer: Buffer, fileName: string, category: string, mimeType: string, size: number, actionId: string): Promise<ActionFileEntity> {
    const fileProps: ActionFileProps = {
      name: fileName,
      category,
      aws_url: '',
      actionId,
      mime_type: mimeType,
      size,
    };

    return this.fileRepository.createActionFile(fileBuffer, fileProps);
  }
}

class DeleteFileUseCase {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }
}

class GetActionFilesByCategoryUseCase {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(actionId: string, category: string): Promise<ActionFileEntity[]> {
    return this.fileRepository.findActionFilesByCategory(actionId, category);
  }
}

class GetOngFilesByCategoryUseCase {
  private fileRepository: FileRepository;

  constructor(fileRepository: FileRepository) {
    this.fileRepository = fileRepository;
  }

  async execute(ngoId: string, category: string): Promise<OngFileEntity[]> {
    return this.fileRepository.findOngFilesByCategory(ngoId, category);
  }
}

export { UploadOngFileUseCase, UploadActionFileUseCase, DeleteFileUseCase, GetActionFilesByCategoryUseCase, GetOngFilesByCategoryUseCase };