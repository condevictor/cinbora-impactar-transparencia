import { FastifyRequest, FastifyReply } from "fastify";
import { CreateUserService, DeleteUserService, GetUserService, UserProps } from "@modules/user";
import { UpdateUserProfileService } from "@modules/user/application/services/UpdateUserProfileService";
import { logService } from "@config/dependencysInjection/logDependencyInjection";
import { CustomError } from "@shared/customError";

class UserController {
  private createUserService: CreateUserService;
  private deleteUserService: DeleteUserService;
  private getUserService: GetUserService;
  private updateUserProfileService: UpdateUserProfileService;

  constructor(
    createUserService: CreateUserService,
    deleteUserService: DeleteUserService,
    getUserService: GetUserService,
    updateUserProfileService: UpdateUserProfileService,
  ) {
    this.createUserService = createUserService;
    this.deleteUserService = deleteUserService;
    this.getUserService = getUserService;
    this.updateUserProfileService = updateUserProfileService;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    try {
      const { name, email, ngoId } = request.body as UserProps;
      const user = await this.createUserService.execute({ name, email, ngoId });
      reply.send({ message: "Usuário criado com sucesso", user });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro interno ao criar usuário" });
      }
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    try {
      const { id } = request.params as { id: string };
      await this.deleteUserService.execute({ id });
      reply.send({ message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro interno ao deletar usuário" });
      }
    }
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.getUserService.executeAll();
      reply.send(users);
    } catch (error) {
      console.error("Erro ao obter usuários:", error);
      reply.status(500).send({ error: "Erro ao obter usuários" });
    }
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }
    try {
      const user = await this.getUserService.executeByEmail(request.user.email)

      reply.send(user);
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      reply.status(500).send({ error: "Erro ao obter usuário" });
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    try {
      const file = await request.file();
      if (!file) {
        reply.status(400).send({ error: "Nenhum arquivo enviado" });
        return;
      }

      const userId = request.user.id;
      const updatedUser = await this.updateUserProfileService.execute(userId, file);
      
      reply.send({ 
        message: "Foto de perfil atualizada com sucesso", 
        user: updatedUser 
      });
    } catch (error) {
      console.error("Erro ao atualizar foto de perfil:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro interno ao atualizar foto de perfil" });
      }
    }
  }
}

export { UserController };