import { FastifyTypedInstance } from "@config/zodType";
import { AuthRoutes } from "@modules/authAPI"
import { userRoutes } from "@modules/user";
import { ongRoutes } from "@modules/ong";
import { actionRoutes } from "@modules/action";
import { fileRoutes } from "@modules/file";

export async function routes(server: FastifyTypedInstance) {
  await server.register(AuthRoutes);
  await server.register(userRoutes);
  await server.register(ongRoutes);
  await server.register(actionRoutes);
  await server.register(fileRoutes);
}