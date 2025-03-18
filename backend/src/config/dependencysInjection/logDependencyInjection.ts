import { LogRepository, LogService } from "@modules/log";

const logRepository = new LogRepository();
const logService = new LogService(logRepository);

export { logService };