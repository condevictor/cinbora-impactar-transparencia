import { Redis } from "@upstash/redis";
import { config } from "@config/dotenv";

let redisClient: Redis;

try {
  redisClient = new Redis({
    url: config.upstashRedisUrl,
    token: config.upstashRedisToken,
  });
} catch (error) {
  console.error("Erro ao inicializar o Redis:", error);
  process.exit(1);
}

export default redisClient;
