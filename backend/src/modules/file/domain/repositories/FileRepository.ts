import prismaClient from "@shared/prismaClient";
import { OngFileEntity, OngFileProps, ActionFileEntity, ActionFileProps } from "@modules/file";
import s3StorageInstance from "@shared/s3Cliente";
import { CustomError } from "@shared/customError";
import { Prisma } from "@prisma/client";

class FileRepository {
  private s3Storage = s3StorageInstance;

  async saveFile(fileBuffer: Buffer, filename: string): Promise<string> {
    try {
      return this.s3Storage.saveFile(fileBuffer, filename);
    } catch {
      throw new CustomError("Erro ao salvar arquivo no S3", 500);
    }
  }

  async createOngFile(fileBuffer: Buffer, fileProps: OngFileProps): Promise<OngFileEntity> {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao criar arquivo da ONG", 400);
      }
      throw new CustomError("Erro ao criar arquivo da ONG", 500);
    }
  }

  async createActionFile(fileBuffer: Buffer, fileProps: ActionFileProps): Promise<ActionFileEntity> {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao criar arquivo da ação", 400);
      }
      throw new CustomError("Erro ao criar arquivo da ação", 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao deletar arquivo", 400);
      }
      throw new CustomError("Erro ao deletar arquivo", 500);
    }
  }

  async deleteFileFromS3(filename: string): Promise<void> {
    try {
      await this.s3Storage.deleteFile(filename);
    } catch {
      throw new CustomError("Erro ao deletar arquivo no S3", 500);
    }
  }

  async findActionFilesByCategory(actionId: string, category: string): Promise<ActionFileEntity[]> {
    try {
      const files = await prismaClient.actionFile.findMany({
        where: {
          actionId,
          category,
        },
      });

      return files.map(file => new ActionFileEntity(file, file.id));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar arquivos da ação por categoria", 400);
      }
      throw new CustomError("Erro ao buscar arquivos da ação por categoria", 500);
    }
  }

  async findOngFilesByCategory(ngoId: string, category: string): Promise<OngFileEntity[]> {
    try {
      const files = await prismaClient.ongFile.findMany({
        where: {
          ngoId: parseInt(ngoId),
          category,
        },
      });

      return files.map(file => new OngFileEntity(file, file.id));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar arquivos da ONG por categoria", 400);
      }
      throw new CustomError("Erro ao buscar arquivos da ONG por categoria", 500);
    }
  }
}

export { FileRepository };