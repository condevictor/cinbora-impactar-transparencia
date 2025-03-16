import { FastifyInstance } from "fastify";
import { createActionSchema, updateActionSchema, deleteActionSchema, updateActionExpensesGraficSchema } from "../schemas/ActionSchema";
import { authMiddleware } from "@middlewares/authMiddleware";
import { cacheMiddleware } from "@middlewares/cacheMiddleware";
import { OngParams, OngActionParams } from "@routeParams/RouteParams";
import { actionController } from "@config/dependencysInjection/actionDependencyInjection";

async function actionRoutes(fastify: FastifyInstance) {
  fastify.get<{ Params: OngParams }>("/ongs/:id/actions", { preHandler: cacheMiddleware(300) }, actionController.getAll.bind(actionController)); 
  fastify.get<{ Params: OngActionParams }>("/ongs/:id/actions/:actionId", { preHandler: cacheMiddleware(300) }, actionController.getOneWithExpenses.bind(actionController));
  fastify.post("/ongs/actions", { preHandler: [authMiddleware], schema: createActionSchema }, actionController.create.bind(actionController)); 
  fastify.put("/ongs/actions/:id", { preHandler: [authMiddleware], schema: updateActionSchema }, actionController.update.bind(actionController)); 
  fastify.delete("/ongs/actions/:id", { preHandler: [authMiddleware], schema: deleteActionSchema }, actionController.delete.bind(actionController));
  fastify.put("/ongs/actions/:actionId/grafic", { preHandler: [authMiddleware], schema: updateActionExpensesGraficSchema }, actionController.updateActionExpensesGrafic.bind(actionController));
  fastify.put("/ongs/actions/:id/image", { preHandler: [authMiddleware] }, actionController.updateActionImage.bind(actionController));
}

export { actionRoutes };
