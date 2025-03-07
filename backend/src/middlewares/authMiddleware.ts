import { FastifyRequest, FastifyReply } from "fastify";
import { JWTService } from "@shared/jwtService";

const jwtService = new JWTService();

type User = {
  id: string;
  name: string;
  email: string;
  ngoId: number;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: User; 
  }
}

async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    reply.status(401).send({ error: "Token not provided" });
    return;
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwtService.verifyToken(token);

    if (typeof decoded === 'string') {
      reply.status(401).send({ error: "Invalid token" });
      return;
    }

    request.user = {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      ngoId: decoded.ngoId,
    };
    
  } catch (error) {
    reply.status(401).send({ error: "Invalid token" });
  }
}

export { authMiddleware };