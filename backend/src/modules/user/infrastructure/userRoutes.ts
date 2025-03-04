import { FastifyInstance } from "fastify";
import { UserController } from "./UserController";
import { LoginAPIController } from "./externalAPI/externalAPIController";
import { loginSchema, createUserSchema, getUserSchema, deleteUserSchema } from "./schemas/UserSchema";
import { authMiddleware } from "@middlewares/authMiddleware";

const userController = new UserController();
const loginAPIController = new LoginAPIController();

async function userRoutes(fastify: FastifyInstance) {
  
  fastify.post("/login", { schema: loginSchema }, loginAPIController.handle.bind(loginAPIController));

  // Rotas protegidas
  fastify.post("/users", { preHandler: [authMiddleware], schema: createUserSchema }, userController.create.bind(userController));
  fastify.delete("/users/:id", { preHandler: [authMiddleware], schema: deleteUserSchema }, userController.delete.bind(userController));
  fastify.get("/users", { preHandler: [authMiddleware], schema: getUserSchema }, userController.getAll.bind(userController));
}

export { userRoutes };