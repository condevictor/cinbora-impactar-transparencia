import { Redis } from "@upstash/redis";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
    clearAllCache(): Promise<boolean>;
  }
}