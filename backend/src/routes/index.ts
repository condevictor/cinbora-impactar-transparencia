import { FastifyTypedInstance } from "@config/zodType";
import { userRoutes } from "@modules/user/infrastructure/userRoutes";
import { ongRoutes } from "@modules/ong/infrastructure/ongRoutes";

export async function routes(server: FastifyTypedInstance) {
  await server.register(userRoutes);
  await server.register(ongRoutes);
}