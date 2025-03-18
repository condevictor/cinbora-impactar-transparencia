import { LogRepository } from "../../domain/repositories/LogRepository";
import { Log } from "../../domain/entities/Log";

class LogService {
  private logRepository: LogRepository;

  constructor(logRepository: LogRepository) {
    this.logRepository = logRepository;
  }

  async logAction(userId: string, userName: string, action: string, model: string, modelId: string, changes: any, description: string) {
    const log: Log = {
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
}

export { LogService };