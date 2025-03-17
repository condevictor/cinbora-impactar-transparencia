import { FastifyRequest, FastifyReply } from "fastify";

function cacheMiddleware(maxAge: number) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    reply.header('Cache-Control', `public, max-age=${maxAge}`);
  };
}

export { cacheMiddleware };