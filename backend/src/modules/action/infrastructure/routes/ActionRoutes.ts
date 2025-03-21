import { FastifyInstance } from "fastify";
import { createActionSchema, updateActionSchema, deleteActionSchema, updateActionExpensesGraficSchema } from "../schemas/ActionSchema";
import { authMiddleware } from "@middlewares/authMiddleware";
import { OngParams, OngActionParams, ActionParams } from "@routeParams/RouteParams";
import { actionController } from "@config/dependencysInjection/actionDependencyInjection";
import { cachedRoute, invalidateCachePattern } from "@middlewares/cacheMiddleware";

async function actionRoutes(fastify: FastifyInstance) {

  // Rota para buscar uma ação específica com suas despesas
  fastify.get<{ Params: OngActionParams }>(
    "/ongs/actions/:actionId", 
    cachedRoute(
      fastify,
      async (request, reply) => {
        const result = await actionController.getOneWithExpenses(request);
        return reply.send(result);
      },
      { ttl: 604800} // Cache de 1 semana
    )
  );

  // Rota para listar todas as ações de uma ONG com cache
  fastify.get<{ Params: OngParams }>(
    "/ongs/:id/actions", 
    cachedRoute(
      fastify, 
      async (request, reply) => {
        const actions = await actionController.getAll(request);
        return reply.send(actions);
      },
      { ttl: 1296000 } // Cache por 15 dias
    )
  ); 

  // Rota para criar uma nova ação
  fastify.post(
    "/ongs/actions", 
    { preHandler: [authMiddleware], schema: createActionSchema }, 
    async (request, reply) => {
      const result = await actionController.create(request);
      if (request.user) {
        // Invalidar o cache das ações da ONG após criar uma nova ação
        await invalidateCachePattern(fastify.redis, `cache:/ongs/${request.user.ngoId}/actions*`);
      }
      return reply.status(201).send(result);
    }
  ); 

  // Rota para atualizar uma ação
  fastify.put(
    "/ongs/actions/:id", 
    { preHandler: [authMiddleware], schema: updateActionSchema }, 
    async (request, reply) => {
      const result = await actionController.update(request);
      if (request.user) {
        // Invalidar cache após atualização de uma ação
        await invalidateCachePattern(fastify.redis, `cache:/ongs/${request.user.ngoId}/actions*`);
      }
      return reply.send(result);
    }
  );

  // Rota para deletar uma ação
  fastify.delete(
    "/ongs/actions/:id", 
    { preHandler: [authMiddleware], schema: deleteActionSchema }, 
    async (request, reply) => {
      const result = await actionController.delete(request);
      if (request.user) {
        // Invalidar cache após exclusão de uma ação
        await invalidateCachePattern(fastify.redis, `cache:/ongs/${request.user.ngoId}/actions*`);
      }
      return reply.send(result);
    }
  );

  // Rota para atualizar o gráfico de despesas de uma ação
  fastify.put<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/grafic", 
    { preHandler: [authMiddleware], schema: updateActionExpensesGraficSchema }, 
    async (request, reply) => {
      const result = await actionController.updateActionExpensesGrafic(request);
      if (request.user) {
        // Invalidar cache após atualização do gráfico
        await invalidateCachePattern(fastify.redis, `cache:/ongs/${request.user.ngoId}/actions*`);
        await invalidateCachePattern(fastify.redis, `cache:/ongs/actions/${request.params.actionId}*`)
        await invalidateCachePattern(fastify.redis, `cache:/ongs/${request.user.ngoId}*`)
      }
      return reply.send(result);
    }
  );

  // Rota para atualizar a imagem de uma ação
  fastify.put(
    "/ongs/actions/:id/image", 
    { preHandler: [authMiddleware] }, 
    async (request, reply) => {
      const result = await actionController.updateActionImage(request);
      if (request.user) {
        // Invalidar cache após atualização da imagem
        await invalidateCachePattern(fastify.redis, `cache:/ongs/${request.user.ngoId}/actions*`);
      }
      return reply.send(result);
    }
  );
}

export { actionRoutes };
