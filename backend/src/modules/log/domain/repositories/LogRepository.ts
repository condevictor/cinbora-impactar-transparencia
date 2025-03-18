import prismaClient from "@shared/prismaClient";
import { Log } from "../entities/Log";

class LogRepository {
  async create(log: Log): Promise<void> {
    await prismaClient.log.create({
      data: log,
    });
  }
}

export { LogRepository };