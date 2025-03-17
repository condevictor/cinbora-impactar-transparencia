import { FastifyInstance } from "fastify";
import { OngController } from "@modules/ong";
import { deleteOngSchema, createOngSchema, updateOngSchema, updateNgoGraficSchema, getNgoAndGraficSchema, getNgosSchema } from "@modules/ong/infrastructure/schemas/OngSchema";
import { authMiddleware } from "@middlewares/authMiddleware";

const ongController = new OngController();

async function ongRoutes(fastify: FastifyInstance) {
  fastify.get("/ongs", { schema: getNgosSchema }, ongController.getAll.bind(ongController));
  fastify.get("/ongs/:id", { schema: getNgoAndGraficSchema }, ongController.getOneWithGrafic.bind(ongController));
  fastify.delete("/ongs/:id", { preHandler: [authMiddleware], schema: deleteOngSchema }, ongController.delete.bind(ongController));
  fastify.post("/ongs", { preHandler: [authMiddleware], schema: createOngSchema }, ongController.create.bind(ongController));
  fastify.put("/ongs", { preHandler: [authMiddleware], schema: updateOngSchema }, ongController.update.bind(ongController));
  fastify.put("/ongs/grafic", { preHandler: [authMiddleware], schema: updateNgoGraficSchema }, ongController.updateNgoGrafic.bind(ongController));
}

export { ongRoutes };