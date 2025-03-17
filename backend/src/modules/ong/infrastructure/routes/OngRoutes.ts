import { FastifyInstance } from "fastify";
import { OngController } from "@modules/ong";
import { deleteOngSchema, createOngSchema, updateOngSchema, updateNgoGraficSchema } from "@modules/ong/infrastructure/schemas/OngSchema";
import { authMiddleware } from "@middlewares/authMiddleware";

const ongController = new OngController();

async function ongRoutes(fastify: FastifyInstance) {
  fastify.get("/ongs", async (request, reply) => {
    const cacheKey = `cache:${request.url}`;

    try {
      const cachedData = await fastify.redis.get(cacheKey);

      if (cachedData) {
        reply.header('x-cache', 'HIT');
        return reply.send(cachedData);
      }

      const ngos = await ongController.getAll(request);
      
      // Converter para objeto plano para evitar problemas de serialização
      const plainData = JSON.parse(JSON.stringify(ngos));
      
      try {
        // O Upstash Redis SDK já vai serializar o objeto
        await fastify.redis.set(cacheKey, plainData, { ex: 60 });
        reply.header('x-cache', 'MISS');
      } catch (cacheError) {
        console.error("Error storing data in cache:", cacheError);
      }

      return reply.send(plainData);
    } catch (error) {
      console.error("Error processing request:", error);
      return reply.status(500).send({ error: "Error fetching ONGs" });
    }
  });

  fastify.get("/ongs/:id", ongController.getOneWithGrafic.bind(ongController));
  fastify.delete("/ongs/:id", { preHandler: [authMiddleware], schema: deleteOngSchema }, ongController.delete.bind(ongController));
  fastify.post("/ongs", { preHandler: [authMiddleware], schema: createOngSchema }, ongController.create.bind(ongController));
  fastify.put("/ongs", { preHandler: [authMiddleware], schema: updateOngSchema }, ongController.update.bind(ongController));
  fastify.put("/ongs/grafic", { preHandler: [authMiddleware], schema: updateNgoGraficSchema }, ongController.updateNgoGrafic.bind(ongController));
}

export { ongRoutes };