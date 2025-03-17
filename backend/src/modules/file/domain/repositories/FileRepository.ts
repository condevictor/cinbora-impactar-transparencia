import prismaClient from "@shared/prismaClient";
import { OngFileEntity, OngFileProps, ActionFileEntity, ActionFileProps } from "@modules/file";
import s3StorageInstance from "@shared/s3Cliente";

class FileRepository {
  private s3Storage = s3StorageInstance;

  async saveFile(fileBuffer: Buffer, filename: string): Promise<string> {
    return this.s3Storage.saveFile(fileBuffer, filename);
  }

  async createOngFile(fileBuffer: Buffer, fileProps: OngFileProps): Promise<OngFileEntity> {
    const aws_url = await this.s3Storage.saveFile(fileBuffer, fileProps.name);
    const aws_name = aws_url.split('/').pop()!; // Extrai o nome do arquivo da URL

    const file = await prismaClient.ongFile.create({
      data: { 
        ...fileProps, 
        aws_name,
        aws_url,
        size: fileProps.size
      },
    });

    return new OngFileEntity(file, file.id);
  }

  async createActionFile(fileBuffer: Buffer, fileProps: ActionFileProps): Promise<ActionFileEntity> {
    const aws_url = await this.s3Storage.saveFile(fileBuffer, fileProps.name);
    const aws_name = aws_url.split('/').pop()!; // Extrai o nome do arquivo da URL

    const file = await prismaClient.actionFile.create({
      data: { 
        ...fileProps, 
        aws_name,
        aws_url,
        size: fileProps.size
      },
    });

    return new ActionFileEntity(file, file.id);
  }

  async delete(id: string): Promise<void> {
    const ongFile = await prismaClient.ongFile.findUnique({
      where: { id },
    });

    if (ongFile) {
      await this.s3Storage.deleteFile(ongFile.aws_name); // Usando aws_name
      await prismaClient.ongFile.delete({
        where: { id },
      });
      return;
    }

    const actionFile = await prismaClient.actionFile.findUnique({
      where: { id },
    });

    if (actionFile) {
      await this.s3Storage.deleteFile(actionFile.aws_name); // Usando aws_name
      await prismaClient.actionFile.delete({
        where: { id },
      });
    }
  }

  async findActionFilesByCategory(actionId: string, category: string): Promise<ActionFileEntity[]> {
    const files = await prismaClient.actionFile.findMany({
      where: {
        actionId,
        category,
      },
    });

    return files.map(file => new ActionFileEntity(file, file.id));
  }

  async findOngFilesByCategory(ngoId: string, category: string): Promise<OngFileEntity[]> {
    const files = await prismaClient.ongFile.findMany({
      where: {
        ngoId: parseInt(ngoId),
        category,
      },
    });

    return files.map(file => new OngFileEntity(file, file.id));
  }

}

export { FileRepository };