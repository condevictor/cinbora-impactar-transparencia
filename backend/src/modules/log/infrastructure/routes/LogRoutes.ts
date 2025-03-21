import { FastifyInstance } from "fastify";
import { getLogsSchema } from "../schemas/LogSchema";
import { authMiddleware } from "@middlewares/authMiddleware";
import { logController } from "@config/dependencysInjection/logDependencyInjection";

async function logRoutes(fastify: FastifyInstance) {
  fastify.get("/logs", { preHandler: [authMiddleware], schema: getLogsSchema }, logController.getAll.bind(logController));
  fastify.get("/logs/:ngoId", { preHandler: [authMiddleware], schema: getLogsSchema }, logController.getByNgoId.bind(logController));
}

export { logRoutes };