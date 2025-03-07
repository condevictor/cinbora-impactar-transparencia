import { FastifyInstance } from "fastify";
import { ActionController } from "@modules/action";
import { createActionSchema, updateActionSchema, deleteActionSchema, updateActionExpensesGraficSchema } from "./schemas/ActionSchema";
import { authMiddleware } from "@middlewares/authMiddleware";

const actionController = new ActionController();

async function actionRoutes(fastify: FastifyInstance) {
  fastify.get("/ongs/:id/actions", actionController.getAll.bind(actionController));
  fastify.get("/ongs/:id/actions/:actionId", actionController.getOneWithExpenses.bind(actionController));
  fastify.post("/ongs/actions", { preHandler: [authMiddleware], schema: createActionSchema }, actionController.create.bind(actionController));
  fastify.put("/ongs/actions/:id", { preHandler: [authMiddleware], schema: updateActionSchema }, actionController.update.bind(actionController));
  fastify.delete("/ongs/actions/:id", { preHandler: [authMiddleware], schema: deleteActionSchema }, actionController.delete.bind(actionController));
  fastify.put("/ongs/actions/:actionId/grafic", { preHandler: [authMiddleware], schema: updateActionExpensesGraficSchema }, actionController.updateActionExpensesGrafic.bind(actionController));
}

export { actionRoutes };