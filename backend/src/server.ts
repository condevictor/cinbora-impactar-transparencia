import 'tsconfig-paths/register';
import Fastify from "fastify";
import { config } from "./config/dotenv"
import { routes } from "./routes/index";
import cors from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from "fastify-type-provider-zod";

const server = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
    reply.code(400).send({ message: error.message || "Erro desconhecido" });
});

const start = async () => {
  await server.register(cors, {
    origin: config.nodeEnv === 'development' ? '*' : config.frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
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
    transformSpecification: (swaggerObject, request, reply) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });

  await server.register(routes);

  try {
    await server.listen({ port: 3333 });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();