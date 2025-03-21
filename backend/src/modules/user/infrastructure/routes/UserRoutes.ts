import { FastifyInstance } from "fastify";
import { UserController } from "@modules/user";
import { createUserSchema, getUserSchema, deleteUserSchema } from "@modules/user";
import { authMiddleware } from "@middlewares/authMiddleware";

const userController = new UserController();

async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/users", { preHandler: [authMiddleware], schema: createUserSchema }, userController.create.bind(userController));
  fastify.delete("/users/:id", { preHandler: [authMiddleware], schema: deleteUserSchema }, userController.delete.bind(userController));
  fastify.get("/users", { preHandler: [authMiddleware], schema: getUserSchema }, userController.getAll.bind(userController));

  // Acho que Lucas pediu
  fastify.post("/user", { preHandler: [authMiddleware] }, userController.getOne.bind(userController)); 
}

export { userRoutes };