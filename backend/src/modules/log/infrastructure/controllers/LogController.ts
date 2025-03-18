import { FastifyRequest, FastifyReply } from "fastify";
import { LogService } from "@modules/log/application/services/LogService";

class LogController {
  private logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const logs = await this.logService.getAllLogs();
      reply.send(logs);
    } catch (error) {
      console.error("Erro ao obter logs:", error);
      reply.status(500).send({ error: "Erro ao obter logs" });
    }
  }

  async getByNgoId(request: FastifyRequest, reply: FastifyReply) {
    const { ngoId } = request.params as { ngoId: number };
    try {
      const logs = await this.logService.getLogsByNgoId(Number(ngoId));
      reply.send(logs);
    } catch (error) {
      console.error("Erro ao obter logs por ONG:", error);
      reply.status(500).send({ error: "Erro ao obter logs por ONG" });
    }
  }
}

export { LogController };