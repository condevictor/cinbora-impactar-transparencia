import { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserService, DeleteUserService, GetUserService, UserProps } from "@modules/user";
import prismaClient from "@shared/prismaClient";
import { createUserService, deleteUserService, getUserService } from "@config/dependencysInjection/userDependencyInjection";

class UserController {
  private createUserService: CreateUserService;
  private deleteUserService: DeleteUserService;
  private getUserService: GetUserService;

  constructor() {
    this.createUserService = createUserService;
    this.deleteUserService = deleteUserService;
    this.getUserService = getUserService;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, email, ngoId } = request.body as UserProps;

    try {
      const user = await this.createUserService.execute({ name, email, ngoId });
      reply.send({ message: "Usuário criado com sucesso", user });
    } catch {
      reply.status(500).send({ error: "Erro ao criar usuário" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      await this.deleteUserService.execute({ id });
      reply.send({ message: "Usuário deletado com sucesso" });
    } catch {
      reply.status(500).send({ error: "Erro ao deletar usuário" });
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await prismaClient.user.findMany();
      reply.send(users);
    } catch {
      reply.status(500).send({ error: "Erro ao obter usuários" });
    }
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    reply.send(request.user);
  }
}

export { UserController };