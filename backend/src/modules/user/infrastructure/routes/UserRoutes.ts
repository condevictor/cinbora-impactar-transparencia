import { FastifyInstance } from "fastify";
import { userController } from "@config/dependencysInjection/userDependencyInjection";
import { createUserSchema, getUserSchema, deleteUserSchema } from "@modules/user";
import { authMiddleware } from "@middlewares/authMiddleware";

async function userRoutes(fastify: FastifyInstance) {
  fastify.post("/users", { preHandler: [authMiddleware], schema: createUserSchema }, userController.create.bind(userController));
  fastify.delete("/users/:id", { preHandler: [authMiddleware], schema: deleteUserSchema }, userController.delete.bind(userController));
  fastify.get("/users", { preHandler: [authMiddleware], schema: getUserSchema }, userController.getAll.bind(userController));

  // Lucas pediu
  fastify.post("/user", { preHandler: [authMiddleware] }, userController.getOne.bind(userController)); 
}

export { userRoutes };