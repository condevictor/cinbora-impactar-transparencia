import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Redis } from "@upstash/redis";

interface CacheOptions {
  /** Tempo de expiração em segundos */
  ttl?: number;
  /** Prefixo opcional para a chave de cache */
  prefix?: string;
  /** Função para extrair uma chave personalizada (sobrepõe a url padrão) */
  keyGenerator?: (request: FastifyRequest) => string;
}

/**
 * Middleware para armazenar em cache o resultado de uma rota
 * @param fastify Instância do Fastify com Redis
 * @param options Opções de configuração do cache
 */
export function withCache(
  fastify: FastifyInstance,
  options: CacheOptions = {}
) {
  const ttl = options.ttl || 600; // Padrão: 60 segundos
  const prefix = options.prefix || 'cache';

  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Não aplicar cache a métodos não-GET
    if (request.method !== 'GET') {
      return;
    }

    try {
      // Gerar a chave de cache
      const cacheKey = options.keyGenerator
        ? `${prefix}:${options.keyGenerator(request)}`
        : `${prefix}:${request.url}`;

      console.log(`Verificando cache para: ${cacheKey}`);
      
      // Verificar se há dados em cache
      const cachedData = await fastify.redis.get(cacheKey);

      if (cachedData) {
        console.log(`CACHE HIT: Dados recuperados do Redis para ${cacheKey}`);
        // Se encontrou dados no cache, responde imediatamente
        reply.header('x-cache', 'HIT');
        reply.send(cachedData);
        return true; // Sinaliza que a resposta foi manipulada
      }

      console.log(`CACHE MISS: Dados não encontrados em cache para ${cacheKey}`);
      
      // Intercepta a função send do reply para armazenar o resultado no cache
      const originalSend = reply.send;
      reply.send = function cachingSend(payload) {
        // Apenas armazena em cache se a resposta for bem-sucedida
        if (reply.statusCode >= 200 && reply.statusCode < 400) {
          try {
            // Garantir que o payload seja serializável (converter para JSON e depois fazer parse)
            const plainData = typeof payload === 'string' 
              ? payload 
              : JSON.parse(JSON.stringify(payload));
            
            console.log(`Armazenando em cache: ${cacheKey} (TTL: ${ttl}s)`);
            // Armazenar no cache
            fastify.redis.set(cacheKey, plainData, { ex: ttl })
              .then(() => console.log(`✓ Dados armazenados com sucesso em ${cacheKey}`))
              .catch(err => fastify.log.error(`Error storing cache: ${err}`));
          } catch (err) {
            fastify.log.error(`Cache serialization error: ${err}`);
          }
        }

        reply.header('x-cache', 'MISS');
        // Restaura o método original e envia a resposta
        reply.send = originalSend;
        return reply.send(payload);
      };

      return false; // Sinaliza que o processamento deve continuar
    } catch (err) {
      fastify.log.error(`Cache middleware error: ${err}`);
      return false; // Continua o processamento mesmo em caso de erro
    }
  };
}

/**
 * Invalida uma chave de cache específica
 * @param redis Cliente Redis
 * @param key Chave a ser invalidada
 */
export async function invalidateCache(redis: Redis, key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`Error invalidating cache key ${key}:`, err);
  }
}

/**
 * Invalida várias chaves de cache que correspondem a um padrão
 * @param redis Cliente Redis
 * @param pattern Padrão para correspondência (ex: 'cache:ongs:*')
 */
export async function invalidateCachePattern(redis: Redis, pattern: string): Promise<void> {
  try {
    // Para o Upstash Redis, precisamos adaptar a abordagem já que ele não suporta SCAN nativo via REST
    // Uma abordagem alternativa é manter um registro das chaves em uso
    const keys = await redis.keys(pattern);
    
    if (keys && keys.length > 0) {
      await Promise.all(keys.map(key => redis.del(key)));
    }
  } catch (err) {
    console.error(`Error invalidating cache pattern ${pattern}:`, err);
  }
}

/**
 * Obtém um manipulador de rota com cache
 * Especialmente útil para rotas que retornam diretamente do controller
 */
export function cachedRoute(
  fastify: FastifyInstance,
  handler: (request: FastifyRequest, reply: FastifyReply) => Promise<any>,
  options: CacheOptions = {}
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Tenta usar o cache primeiro
    const handled = await withCache(fastify, options)(request, reply);
    
    // Se a resposta já foi manipulada pelo cache, retorna
    if (handled) {
      return;
    }
    
    // Caso contrário, executa o handler original
    return handler(request, reply);
  };
}
