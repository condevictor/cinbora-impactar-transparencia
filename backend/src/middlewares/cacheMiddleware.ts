import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function cacheMiddleware(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip caching for non-GET requests
    if (request.method !== 'GET') {
      return;
    }
    
    if (!fastify.redis) {
      return;
    }

    const cacheKey = `cache:${request.url}`;

    try {
      const cachedResponse = await fastify.redis.get(cacheKey);

      if (cachedResponse) {
        reply.header('x-cache', 'HIT');
        return reply.send(cachedResponse);
      }
    } catch (err) {
      console.error('Error accessing Redis during cache check:', err);
    }
  });

  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
    // Skip caching for non-GET requests or non-successful responses
    if (request.method !== 'GET' || reply.statusCode !== 200) {
      return payload;
    }
    
    if (!fastify.redis) {
      return payload;
    }

    const cacheKey = `cache:${request.url}`;

    try {
      let dataToCache;
      
      if (typeof payload === 'string') {
        try {
          dataToCache = JSON.parse(payload);
        } catch (parseError) {
          return payload;
        }
      } else if (payload) {
        dataToCache = payload;
      } else {
        return payload;
      }
      
      await fastify.redis.set(cacheKey, dataToCache, { ex: 60 });
    } catch (err) {
      console.error('Error saving response to Redis:', err);
    }

    return payload;
  });
}