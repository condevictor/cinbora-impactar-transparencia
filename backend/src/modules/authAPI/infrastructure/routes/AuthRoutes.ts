import { FastifyInstance } from "fastify";
import { loginSchema } from "../schemas/AuthSchema";
import { loginAPIController } from "@config/dependencysInjection/authAPIDependencyInjection";

async function AuthRoutes(fastify: FastifyInstance) {
    fastify.post("/login", { schema: loginSchema }, loginAPIController.handle.bind(loginAPIController));
}

export { AuthRoutes };