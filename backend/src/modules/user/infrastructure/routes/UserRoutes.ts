import { FastifyInstance } from "fastify";
import { userController } from "@config/dependencysInjection/userDependencyInjection";
import { createUserSchema, getUserSchema, deleteUserSchema, updateProfileSchema } from "@modules/user";
import { authMiddleware } from "@middlewares/authMiddleware";

async function userRoutes(fastify: FastifyInstance) {

  fastify.post("/users", { preHandler: [authMiddleware], schema: createUserSchema }, userController.create.bind(userController));
  fastify.delete("/users/:id", { preHandler: [authMiddleware], schema: deleteUserSchema }, userController.delete.bind(userController));
  fastify.get("/users", { preHandler: [authMiddleware], schema: getUserSchema }, userController.getAll.bind(userController));
  fastify.post("/user", { preHandler: [authMiddleware] }, userController.getOne.bind(userController)); 
  
  // Nova rota para atualizar foto de perfil
  fastify.put("/users/profile", { 
    preHandler: [authMiddleware], 
    schema: updateProfileSchema 
  }, userController.updateProfile.bind(userController));
}

export { userRoutes };