import { FastifyInstance } from "fastify";
import { OngController } from "@modules/ong";
import {
  deleteOngSchema,
  createOngSchema,
  updateOngSchema,
  updateNgoGraficSchema,
  getNgoAndGraficSchema,
  getNgosSchema,
} from "@modules/ong/infrastructure/schemas/OngSchema";
import { authMiddleware } from "@middlewares/authMiddleware";
import { cachedRoute, invalidateCachePattern } from "@middlewares/cacheMiddleware";

const ongController = new OngController();

async function ongRoutes(fastify: FastifyInstance) {

  // Rota para devolver a ONG e seu gráfico
  fastify.get("/ongs/:id", { schema: getNgoAndGraficSchema }, async (request, reply) => {
    const result = await ongController.getOneWithGrafic(request);
    return reply.send(result);
  });

  // Rota para atualizar o gráfico da ONG
  fastify.put("/ongs/grafic", { preHandler: [authMiddleware], schema: updateNgoGraficSchema }, async (request, reply) => {
    const result = await ongController.updateNgoGrafic(request);
    return reply.send(result);
  });

  // Rota com cache
  fastify.get(
    "/ongs",
    { schema: getNgosSchema },
    cachedRoute(
      fastify,
      async (request, reply) => {
        const ngos = await ongController.getAll();
        return reply.send(ngos);
      },
      { ttl: 2592000 } // Cache por 30 dias
    )
  );

  // Rota para deletar uma ONG
  fastify.delete("/ongs/:id", { preHandler: [authMiddleware], schema: deleteOngSchema }, async (request, reply) => {
    const result = await ongController.delete(request);
    await invalidateCachePattern(fastify.redis, `cache:/ongs*`); // Invalidar cache após exclusão
    return reply.send(result);
  });

  // Rota para criar uma ONG
  fastify.post("/ongs", { preHandler: [authMiddleware], schema: createOngSchema }, async (request, reply) => {
    const ong = await ongController.create(request);
    await invalidateCachePattern(fastify.redis, `cache:/ongs*`); // Invalidar cache após criação
    return reply.status(201).send(ong);
  });

  // Rota para atualizar uma ONG
  fastify.put("/ongs", { preHandler: [authMiddleware], schema: updateOngSchema }, async (request, reply) => {
    const result = await ongController.update(request);
    await invalidateCachePattern(fastify.redis, `cache:/ongs`);
    return reply.send(result);
  });
}

export { ongRoutes };
