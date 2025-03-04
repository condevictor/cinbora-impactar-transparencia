import { FastifyInstance } from "fastify";
import { OngController } from "./OngController";
import { getOngSchema, deleteOngSchema, createOngSchema } from "./schemas/OngSchema";

const ongController = new OngController();

async function ongRoutes(fastify: FastifyInstance) {
  fastify.get("/ongs", { schema: getOngSchema }, ongController.getAll.bind(ongController));
  fastify.delete("/ongs/:id", { schema: deleteOngSchema }, ongController.delete.bind(ongController));
  fastify.post("/ongs", { schema: createOngSchema }, ongController.create.bind(ongController));
}

export { ongRoutes };