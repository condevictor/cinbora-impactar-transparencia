import { FastifyInstance } from "fastify";
import { localCache, keyPatternMap } from "@shared/redisClient";

export async function diagnosticRoutes(fastify: FastifyInstance) {
  // Rota para verificar estatísticas do cache
  fastify.get("/admin/cache-stats", async () => {
    // Verifique se há uma senha de administrador ou IP permitido
    // Isso é importante para não expor informações em produção
    
    const localStats = localCache.getStats();
    const patternKeys = Object.entries(keyPatternMap).map(([pattern, keys]) => ({
      pattern,
      keyCount: keys.size,
      keys: Array.from(keys)
    }));
    
    const redisKeys = await fastify.redis.keys('cache:*');
    
    return {
      localCache: {
        hits: localStats.hits,
        misses: localStats.misses,
        keys: localStats.keys,
        ksize: localStats.ksize,
        vsize: localStats.vsize
      },
      patterns: patternKeys,
      redisKeyCount: redisKeys.length
    };
  });
  
  // Rota para testar a invalidação de cache
  fastify.post("/admin/invalidate-cache", async (request, reply) => {
    const body = request.body as { pattern: string };
    
    if (!body.pattern) {
      return reply.status(400).send({ error: "Pattern não especificado" });
    }
    
    const keysInvalidated = await fastify.redis.delByPattern(body.pattern);
    
    return {
      pattern: body.pattern,
      keysInvalidated
    };
  });
  
  // Rota para limpar todo o cache
  fastify.post("/admin/clear-cache", async () => {
    const localKeysCleared = localCache.keys().length;
    localCache.flushAll();
    
    // Limpar todos os registros de padrões
    Object.keys(keyPatternMap).forEach(pattern => {
      keyPatternMap[pattern].clear();
    });
    
    const redisKeysCleared = await fastify.redis.delByPattern("cache:*");
    
    return {
      localKeysCleared,
      redisKeysCleared
    };
  });
}