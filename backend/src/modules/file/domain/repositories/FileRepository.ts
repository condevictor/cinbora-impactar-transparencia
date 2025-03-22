import prismaClient from "@shared/prismaClient";
import { OngFileEntity, OngFileProps, ActionFileEntity, ActionFileProps } from "@modules/file";
import s3StorageInstance from "@shared/s3Cliente";
import { CustomError } from "@shared/customError";
import { Prisma } from "@prisma/client";

class FileRepository {
  private s3Storage = s3StorageInstance;

  async saveFile(fileBuffer: Buffer, filename: string, ngoId?: number, actionId?: string): Promise<string> {
    try {
      let path;
      
      // Se tiver tanto ngoId quanto actionId, cria o mesmo path usado em createActionFile
      if (ngoId && actionId) {
        path = this.s3Storage.buildPath(ngoId, 'actions', actionId);
      }
      
      return this.s3Storage.saveFile(fileBuffer, filename, path);
    } catch {
      throw new CustomError("Erro ao salvar arquivo no S3", 500);
    }
  }

  async createOngFile(fileBuffer: Buffer, fileProps: OngFileProps): Promise<OngFileEntity> {
    try {
      // Construir caminho para arquivos da ONG
      const path = this.s3Storage.buildPath(fileProps.ngoId, 'files');
      
      // Salvar arquivo com o novo caminho
      const aws_url = await this.s3Storage.saveFile(fileBuffer, fileProps.name, path);
      
      // O aws_name agora contém o caminho completo após amazonaws.com/
      const aws_name = aws_url.split('amazonaws.com/')[1]; // Algo como "1/files/uuid-filename.jpg"

      const file = await prismaClient.ongFile.create({
        data: { 
          ...fileProps, 
          aws_name, // Agora armazena o caminho completo
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
      // Primeiro, obtenha o ngoId associado a esta ação
      const action = await prismaClient.action.findUnique({
        where: { id: fileProps.actionId }
      });
      
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
      
      // Construir caminho para arquivos da ação
      const path = this.s3Storage.buildPath(action.ngoId, 'actions', fileProps.actionId);
      
      // Salvar arquivo com o novo caminho
      const aws_url = await this.s3Storage.saveFile(fileBuffer, fileProps.name, path);
      
      // O aws_name agora contém o caminho completo
      const aws_name = aws_url.split('amazonaws.com/')[1]; // Algo como "1/actions/2/uuid-filename.jpg"

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

  async delete(id: string): Promise<{ category: string }> {
    try {
      const ongFile = await prismaClient.ongFile.findUnique({
        where: { id },
      });

      if (ongFile) {
        await this.s3Storage.deleteFile(ongFile.aws_name);
        await prismaClient.ongFile.delete({
          where: { id },
        });
        return {
          category: ongFile.category
        };
      }

      const actionFile = await prismaClient.actionFile.findUnique({
        where: { id },
      });

      if (actionFile) {
        await this.s3Storage.deleteFile(actionFile.aws_name);
        await prismaClient.actionFile.delete({
          where: { id },
        });
        return {
          category: actionFile.category
        };
      }
      
      throw new CustomError("Arquivo não encontrado", 404);
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
    } catch (error) {
      console.error("Erro ao deletar arquivo no S3:", error);
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


async deleteEntityFiles(type: 'ong' | 'action' | 'user', entityId: string | number, ngoId: number): Promise<number> {
  try {
    let path: string;
    
    switch (type) {
      case 'ong':
        path = `${ngoId}`;
        break;
      case 'action':
        path = `${ngoId}/actions/${entityId}`;
        break;
      case 'user':
        path = `${ngoId}/users/${entityId}`;
        break;
    }
    
    return await this.s3Storage.deleteFolder(path);
  } catch (error) {
    console.error(`Erro ao excluir arquivos de ${type} ${entityId}:`, error);
    throw new CustomError(`Erro ao excluir arquivos de ${type}`, 500);
  }
  }
}

export { FileRepository };