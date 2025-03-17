import { FastifyInstance } from "fastify";
import { ActionController } from "@modules/action";
import { createActionSchema, updateActionSchema, deleteActionSchema, updateActionExpensesGraficSchema } from "../schemas/ActionSchema";
import { authMiddleware } from "@middlewares/authMiddleware";

const actionController = new ActionController();

async function actionRoutes(fastify: FastifyInstance) {
  // Implementação do cache para GET /ongs/:id/actions
  fastify.get("/ongs/:id/actions", async (request, reply) => {
    const { id: ngoId } = request.params as { id: number };
    const cacheKey = `cache:${request.url}`;

    try {
      // Verificar cache primeiro
      const cachedData = await fastify.redis.get(cacheKey);

      if (cachedData) {
        reply.header('x-cache', 'HIT');
        return reply.send(cachedData);
      }

      // Buscar do banco de dados se não estiver em cache
      const actions = await actionController.getAll(request, reply);
      
      // Converter para objeto plano
      const plainData = JSON.parse(JSON.stringify(actions));
      
      try {
        // Armazenar no cache por 60 segundos
        await fastify.redis.set(cacheKey, plainData, { ex: 300 });
        reply.header('x-cache', 'MISS');
      } catch (cacheError) {
        console.error("Error storing actions in cache:", cacheError);
      }

      return reply.send(plainData);
    } catch (error) {
      console.error("Error fetching actions:", error);
      return reply.status(500).send({ error: "Error fetching actions" });
    }
  });
  
  fastify.get("/ongs/:id/actions/:actionId", actionController.getOneWithExpenses.bind(actionController));
  
  // Implementar invalidação de cache após POST
  fastify.post("/ongs/actions", { preHandler: [authMiddleware], schema: createActionSchema }, async (request, reply) => {
    try {
      // Criar a ação
      const result = await actionController.create(request, reply);
      
      if (request.user) {
        // Invalidar o cache das ações da ONG após criar uma nova ação
        const cacheKey = `cache:/ongs/${request.user.ngoId}/actions`;
        await fastify.redis.del(cacheKey);
      }
      
      return result;
    } catch (error) {
      console.error("Error creating action:", error);
      return reply.status(500).send({ error: "Error creating action" });
    }
  });
  
  fastify.put("/ongs/actions/:id", { preHandler: [authMiddleware], schema: updateActionSchema }, actionController.update.bind(actionController));
  fastify.delete("/ongs/actions/:id", { preHandler: [authMiddleware], schema: deleteActionSchema }, actionController.delete.bind(actionController));
  fastify.put("/ongs/actions/:actionId/grafic", { preHandler: [authMiddleware], schema: updateActionExpensesGraficSchema }, actionController.updateActionExpensesGrafic.bind(actionController));
}

export { actionRoutes };
