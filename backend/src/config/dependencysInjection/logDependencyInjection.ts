import { LogRepository } from "@modules/log/domain/repositories/LogRepository";
import { LogService } from "@modules/log/application/services/LogService";
import { LogController } from "@modules/log/infrastructure/controllers/LogController";

const logRepository = new LogRepository();
const logService = new LogService(logRepository);
const logController = new LogController(logService);

export { logService, logController };