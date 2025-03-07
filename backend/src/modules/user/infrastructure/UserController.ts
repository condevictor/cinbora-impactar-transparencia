import { FastifyRequest, FastifyReply } from "fastify";
import { UserRepository, CreateUserUseCase, DeleteUserUseCase, UserProps } from "@modules/user";
import prismaClient from "@shared/prismaClient";

class UserController {
  private createUserUseCase: CreateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;

  constructor() {
    const userRepository = new UserRepository();
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.deleteUserUseCase = new DeleteUserUseCase(userRepository);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, ngoId } = request.body as UserProps;

    try {
      const existingUser = await prismaClient.user.findUnique({ where: { email } });
      if (existingUser) {
        reply.status(400).send({ error: "Email já cadastrado" });
        return;
      }

      const user = await this.createUserUseCase.execute({ name, email, ngoId });
      reply.send({ message: "Usuário criado com sucesso", user });
    } catch (error) {
      reply.status(500).send({ error: "Erro ao criar usuário" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      await this.deleteUserUseCase.execute({ id });
      reply.send({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      reply.status(500).send({ error: "Erro ao deletar usuário" });
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await prismaClient.user.findMany();
      reply.send(users);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao obter usuários" });
    }
  }
}

export { UserController };