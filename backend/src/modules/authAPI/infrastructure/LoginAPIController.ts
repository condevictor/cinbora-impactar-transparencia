import { FastifyRequest, FastifyReply } from "fastify";
import { AuthController } from "@modules/authAPI";
import { CustomError } from "@middlewares/customError";

class LoginAPIController {
  private authController: AuthController;

  constructor() {
    this.authController = new AuthController();
  }

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    try {
      const { user, ngo, token, actions } = await this.authController.authenticate(email, password);
      reply.send({ message: "Login bem-sucedido", user, ngo, token, actions });
    } catch (error) {
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao processar login" });
      }
    }
  }
}

export { LoginAPIController };