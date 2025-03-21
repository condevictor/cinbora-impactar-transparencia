import 'tsconfig-paths/register';
import Fastify from "fastify";
import { config } from "./config/dotenv";
import { routes } from "./routes/index";
import cors from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";
import fastifyMultipart from "@fastify/multipart"; 
import { CustomError } from '@shared/customError';
import { Prisma } from "@prisma/client";
import redisClient, { localCache } from "@shared/redisClient";

const server = Fastify({ 
  logger: true,
  // Aumentar o timeout para operações que podem demorar mais
  connectionTimeout: 60000,
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.status(400).send({ error: "Dados inválidos", details: error.validation });
  } else if (error instanceof CustomError) {
    reply.status(error.statusCode).send({ error: error.message });
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    reply.status(400).send({ error: "Erro no banco de dados", message: error.message });
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    reply.status(422).send({ error: "Erro de validação no Prisma", message: error.message });
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    reply.status(500).send({ error: "Erro de inicialização do Prisma", message: error.message });
  } else {
    console.error("Erro interno:", error);
    reply.status(500).send({ error: "Erro interno no servidor", message: error.message });
  }
});

const start = async () => {
  await server.register(cors, {
    origin: config.nodeEnv === 'development' ? 'http://localhost:3000' : config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API Documentation",
        description: "API documentation for the project",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform, 
  });

  await server.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  await server.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // Limite de tamanho de arquivo de 10 MB
    },
  });

  console.log("Verificando conexão com Redis Upstash...");
  try {
    // Método ping simples em vez de set/get - economiza um comando
    await redisClient.ping();
    console.log("Conexão com Redis estabelecida com sucesso");
    
    // Decorador do cliente Redis otimizado
    server.decorate('redis', redisClient);
    
    // Adicionar método helper para limpar todo o cache - otimizado
    server.decorate('clearAllCache', async () => {
      try {
        // Limpar cache local imediatamente
        localCache.flushAll();
        
        // Limpar cache Redis de forma eficiente
        await redisClient.delByPattern('cache:*');
        server.log.info('Cache limpo com sucesso');
        return true;
      } catch (err) {
        server.log.error(`Erro ao limpar cache: ${err}`);
        return false;
      }
    });
  } catch (err) {
    console.error("Erro ao conectar ao Redis Upstash:", err);
    process.exit(1);
  }
  
  await server.register(routes);

  try {
    await server.listen({ port: 3333 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();