import { FastifyInstance } from "fastify";
import { UserController } from "@modules/user";
import { createUserSchema, getUserSchema, deleteUserSchema } from "./schemas/UserSchema";
import { authMiddleware } from "@middlewares/authMiddleware";

const userController = new UserController();

async function userRoutes(fastify: FastifyInstance) {

  // Rotas protegidas
  fastify.post("/users", { preHandler: [authMiddleware], schema: createUserSchema }, userController.create.bind(userController));
  fastify.delete("/users/:id", { preHandler: [authMiddleware], schema: deleteUserSchema }, userController.delete.bind(userController));
  fastify.get("/users", { preHandler: [authMiddleware], schema: getUserSchema }, userController.getAll.bind(userController));
}

export { userRoutes };