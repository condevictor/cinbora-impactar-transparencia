import { FastifyInstance } from "fastify";
import { LoginAPIController } from "@modules/authAPI";
import { loginSchema } from "./schemas/AuthSchema";

const loginAPIController = new LoginAPIController();

async function AuthRoutes(fastify: FastifyInstance) {
    fastify.post("/login", { schema: loginSchema }, loginAPIController.handle.bind(loginAPIController));
}

export { AuthRoutes };