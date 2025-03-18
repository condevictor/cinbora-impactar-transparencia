import { LogRepository } from "@modules/log/domain/repositories/LogRepository";
import { Log } from "../../domain/entities/Log";

class LogService {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async logAction(ngoId: number, userId: string, userName: string, action: string, model: string, modelId: string, changes: any, description: string) {
    const log: Log = {
      ngoId,
      userId,
      userName,
      action,
      model,
      modelId,
      changes,
      description,
      timestamp: new Date(),
    };

    await this.logRepository.create(log);
  }

  async getAllLogs() {
    return this.logRepository.findAll();
  }

  async getLogsByNgoId(ngoId: number) {
    return this.logRepository.findByNgoId(ngoId);
  }
}

export { LogService };