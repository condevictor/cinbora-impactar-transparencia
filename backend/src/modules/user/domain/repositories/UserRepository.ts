import prismaClient from "@shared/prismaClient";
import { User } from "@modules/user";
import { CustomError } from "@shared/customError";
import { Prisma } from "@prisma/client";

class UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      const user = await prismaClient.user.findUnique({ where: { id } });
      if (!user) return null;
      return new User(user, user.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar usuário por ID", 400);
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await prismaClient.user.findUnique({ where: { email } });
      if (!user) return null;
      return new User(user, user.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar usuário por email", 400);
      }
      throw error;
    }
  }

  async create(data: User): Promise<User> {
    try {
      const user = await prismaClient.user.create({ data });
      return new User(user, user.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao criar usuário", 400);
      }
      throw new CustomError("Erro ao criar usuário", 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prismaClient.user.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao deletar usuário", 400);
      }
      throw new CustomError("Erro ao deletar usuário", 500);
    }
  }

  async findAll(): Promise<User[]> {
    const users = await prismaClient.user.findMany();
    return users.map(user => new User(user, user.id));
  }
}

export { UserRepository };