import prismaClient from "@shared/prismaClient";
import { Log } from "../entities/Log";

class LogRepository {
  async create(log: Log): Promise<void> {
    await prismaClient.log.create({
      data: {
        ngoId: log.ngoId,
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        model: log.model,
        modelId: log.modelId.toString(), // Converter para string para garantir
        changes: log.changes,
        description: log.description,
        timestamp: log.timestamp,
      },
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