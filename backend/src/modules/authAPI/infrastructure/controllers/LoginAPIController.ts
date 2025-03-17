import { FastifyRequest, FastifyReply } from "fastify";
import { AuthController } from "@modules/authAPI";
import { CustomError } from "../../../../shared/customError";

class LoginAPIController {
  private authController: AuthController;

  constructor(authController: AuthController) {
    this.authController = authController;
  }

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    try {
      const { user, ngo, token, actions } = await this.authController.authenticate(email, password);

      reply.send({ message: "Login bem-sucedido", user, token, ngo, actions }); 
    } catch (error) {
      console.error("Error durante o no LoginController login:", error);

      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao processar login no LoginController" });
      }
    }
  }
}

export { LoginAPIController };