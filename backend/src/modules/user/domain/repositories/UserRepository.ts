import prismaClient from "@shared/prismaClient";
import { User, UserProps } from "@modules/user";
import { CustomError } from "@shared/customError";
import { DeleteFileService } from "@modules/file";
import { Prisma } from "@prisma/client";

class UserRepository {
  private deleteFileService: DeleteFileService;

  constructor(deleteFileService: DeleteFileService) {
    this.deleteFileService = deleteFileService;
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await prismaClient.user.findUnique({
        where: { id },
      });
      
      if (!user) return null;
      
      // Criar uma instância de User incluindo o profileUrl
      const userInstance = new User({
        name: user.name,
        email: user.email,
        ngoId: user.ngoId
      }, user.id);
      
      // Adicionar explicitamente o profileUrl
      userInstance.profileUrl = user.profileUrl;
      
      return userInstance;
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao buscar usuário: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao buscar usuário", 400);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prismaClient.user.findUnique({ where: { email } });
      if (!user) return null;
      
      // Criar uma instância de User incluindo o profileUrl
      const userInstance = new User({
        name: user.name,
        email: user.email,
        ngoId: user.ngoId
      }, user.id);
      
      // Adicionar explicitamente o profileUrl
      userInstance.profileUrl = user.profileUrl;
      
      return userInstance;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar usuário por email", 400);
      }
      throw error;
    }
  }

  async create(data: UserProps): Promise<User> {
    try {
      const user = await prismaClient.user.create({
        data: {
          ...data,
          profileUrl: "", // Inicializa com string vazia
        },
      });
      
      // Criar uma instância de User incluindo o profileUrl
      const userInstance = new User({
        name: user.name,
        email: user.email,
        ngoId: user.ngoId
      }, user.id);
      
      // Adicionar explicitamente o profileUrl
      userInstance.profileUrl = user.profileUrl;
      
      return userInstance;
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao criar usuário: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao criar usuário", 400);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Buscar o usuário para obter a URL do perfil
      const user = await this.findById(id);
      
      // Se o usuário tem uma foto de perfil, excluí-la
      if (user && user.profileUrl) {
        // Extrair o nome do arquivo da URL
        const key = user.profileUrl.split('/').pop() || '';
        if (key) {
          await this.deleteFileService.execute(key);
        }
      }
      
      // Deletar o usuário
      await prismaClient.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao excluir usuário: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao excluir usuário", 400);
    }
  }

  async updateProfile(id: string, profileUrl: string): Promise<User> {
    try {
      const updatedUser = await prismaClient.user.update({
        where: { id },
        data: { profileUrl },
      });
      
      // Criar uma instância de User incluindo o profileUrl
      const userInstance = new User({
        name: updatedUser.name,
        email: updatedUser.email,
        ngoId: updatedUser.ngoId
      }, updatedUser.id);
      
      // Adicionar explicitamente o profileUrl
      userInstance.profileUrl = updatedUser.profileUrl;
      
      return userInstance;
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao atualizar perfil: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao atualizar perfil", 400);
    }
  }

  async deleteAllFromNgo(ngoId: number): Promise<void> {
    try {
      // Buscar todos os usuários da ONG
      const users = await prismaClient.user.findMany({
        where: { ngoId },
      });
      
      // Para cada usuário, excluir sua foto de perfil antes de excluí-lo
      for (const user of users) {
        if (user.profileUrl) {
          const key = user.profileUrl.split('/').pop() || '';
          if (key) {
            await this.deleteFileService.execute(key);
          }
        }
      }
      
      // Excluir todos os usuários da ONG
      await prismaClient.user.deleteMany({
        where: { ngoId },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(`Erro ao excluir usuários da ONG: ${error.message}`, 400);
      }
      throw new CustomError("Erro ao excluir usuários da ONG", 400);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await prismaClient.user.findMany();
      return users.map(user => {
        // Criar uma instância de User incluindo o profileUrl
        const userInstance = new User({
          name: user.name,
          email: user.email,
          ngoId: user.ngoId
        }, user.id);
        
        // Adicionar explicitamente o profileUrl
        userInstance.profileUrl = user.profileUrl;
        
        return userInstance;
      });
    } catch (error) {
      throw new CustomError("Erro ao buscar todos os usuários", 500);
    }
  }
}

export { UserRepository };