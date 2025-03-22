import { FastifyInstance } from "fastify";
import {
  deleteOngSchema,
  createOngSchema,
  updateOngSchema,
  updateNgoGraficSchema,
  getNgoAndGraficSchema,
  getNgosSchema,
} from "@modules/ong";
import { ongController } from "@config/dependencysInjection/ongDependencyInjection";
import { OngParams } from "@routeParams/RouteParams";
import { authMiddleware } from "@middlewares/authMiddleware";
import { cachedRoute, invalidateCache } from "@middlewares/cacheMiddleware";

async function ongRoutes(fastify: FastifyInstance) {

  // Rota para devolver a ONG e seu gráfico
  fastify.get<{ Params: { id: number } }>(
    "/ongs/:id", 
    { schema: getNgoAndGraficSchema }, 
    cachedRoute(
      fastify, 
      async (request, reply) => {
        const result = await ongController.getOneWithGrafic(request);
        return reply.send(result);
      },
      { 
        ttl: 604800, // Cache de 1 semana
        keyGenerator: (req) => {
          const params = req.params as { id: number };
          return `ong:${params.id}:with-grafic`;
        }, 
        tags: ['ongs'] // Para invalidação por tag
      }
    )
  );

  // Rota para atualizar o gráfico da ONG
  fastify.put("/ongs/grafic", { preHandler: [authMiddleware], schema: updateNgoGraficSchema }, async (request, reply) => {
    const result = await ongController.updateNgoGrafic(request);
    // Invalidar apenas o gráfico específico em vez de todos os caches
    const ongId = (request.body as any).id;
    await invalidateCache(fastify, `cache:ong:${ongId}:with-grafic`);
    return reply.send(result);
  });

  // Rota com cache para lista de ONGs
  fastify.get(
    "/ongs",
    { schema: getNgosSchema },
    cachedRoute(
      fastify,
      async (request, reply) => {
        const ngos = await ongController.getAll();
        return reply.send(ngos);
      },
      { 
        ttl: 2592000, // Cache por 30 dias
        keyGenerator: () => `ongs:list`, // Chave específica e simples
        tags: ['ongs']
      }
    )
  );

  // Rota para deletar uma ONG
  fastify.delete<{ Params: OngParams }>("/ongs/:id", { preHandler: [authMiddleware], schema: deleteOngSchema }, async (request, reply) => {
    const result = await ongController.delete(request);
    
    // Invalidar apenas as chaves específicas em vez de um padrão amplo
    await Promise.all([
      invalidateCache(fastify, `cache:ong:${request.params.ngoId}:with-grafic`),
      invalidateCache(fastify, `cache:ongs:list`)
    ]);
    
    return reply.send(result);
  });

  // Rota para criar uma ONG
  fastify.post("/ongs", { preHandler: [authMiddleware], schema: createOngSchema }, async (request, reply) => {
    const ong = await ongController.create(request);
    
    // Invalidar apenas a lista de ONGs, não os detalhes individuais
    await invalidateCache(fastify, `cache:ongs:list`);
    
    return reply.status(201).send(ong);
  });

  // Rota para atualizar uma ONG
  fastify.put("/ongs", { preHandler: [authMiddleware], schema: updateOngSchema }, async (request, reply) => {
    const result = await ongController.update(request);
    const ongId = (request.body as any).id;
    
    // Invalidar apenas as chaves específicas afetadas
    await Promise.all([
      invalidateCache(fastify, `cache:ong:${ongId}:with-grafic`),
      invalidateCache(fastify, `cache:ongs:list`)
    ]);
    
    return reply.send(result);
  });
}

export { ongRoutes };