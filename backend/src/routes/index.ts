import { FastifyTypedInstance } from "@config/zodType";
import { AuthRoutes } from "@modules/authAPI";
import { userRoutes } from "@modules/user";
import { ongRoutes } from "@modules/ong";
import { actionRoutes } from "@modules/action";
import { fileRoutes } from "@modules/file";
import { logRoutes } from "@modules/log";
import { authMiddleware } from "@middlewares/authMiddleware";

export async function routes(server: FastifyTypedInstance) {
  await server.register(AuthRoutes);
  await server.register(userRoutes);
  await server.register(ongRoutes);
  await server.register(actionRoutes);
  await server.register(fileRoutes);
  await server.register(logRoutes);

  // Endpoint de diagnóstico do cache - Protegido por autenticação
  server.get('/admin/cache-status', { preHandler: [authMiddleware] }, async (request, reply) => {
    try {
      // Listar todas as chaves no cache
      const keys = await server.redis.keys('cache:*');
      
      // Para cada chave, obter o TTL restante
      const cacheInfo = await Promise.all(
        keys.map(async (key) => {
          const ttl = await server.redis.ttl(key);
          return {
            key,
            ttlSeconds: ttl,
            expiresIn: ttl > 0 ? `${ttl} segundos` : 'Expirado',
          };
        })
      );
      
      return reply.send({
        totalCacheEntries: keys.length,
        cacheEntries: cacheInfo
      });
    } catch (error) {
      console.error('Erro ao obter status do cache:', error);
      return reply.status(500).send({ error: 'Erro ao obter status do cache' });
    }
  });
}