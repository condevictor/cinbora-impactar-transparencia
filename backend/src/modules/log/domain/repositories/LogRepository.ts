import prismaClient from "@shared/prismaClient";
import { Log } from "../entities/Log";

class LogRepository {
  async create(log: Log): Promise<void> {
    await prismaClient.log.create({
      data: log,
    });
  }

  async findAll(): Promise<Log[]> {
    return prismaClient.log.findMany();
  }

  async findByNgoId(ngoId: number): Promise<Log[]> {
    return prismaClient.log.findMany({
      where: { ngoId },
    });
  }
}

export { LogRepository };