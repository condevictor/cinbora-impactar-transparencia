import { FastifyInstance } from "fastify";
import { getLogsSchema } from "../schemas/LogSchema";
import { authMiddleware } from "@middlewares/authMiddleware";
import { logController } from "@config/dependencysInjection/logDependencyInjection";

async function logRoutes(fastify: FastifyInstance) {
  // Rota para obter apenas o último log da ONG do usuário autenticado
  fastify.get("/logs/last", { preHandler: [authMiddleware], schema: getLogsSchema }, logController.getLastLog.bind(logController));
  
  // Rota para obter todos os logs da ONG do usuário autenticado (sem precisar passar ngoId)
  fastify.get("/logs", { preHandler: [authMiddleware], schema: getLogsSchema }, logController.getOngLogs.bind(logController));
}

export { logRoutes };