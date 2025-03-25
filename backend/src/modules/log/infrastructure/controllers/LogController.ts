import { FastifyRequest, FastifyReply } from "fastify";
import { LogService } from "@modules/log/application/services/LogService";

class LogController {
  private logService: LogService;

  constructor(logService: LogService) {
    this.logService = logService;
  }

  // método para obter apenas o último log da ONG do usuário autenticado
  async getLastLog(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user || !request.user.ngoId) {
      return reply.status(401).send({ error: "Usuário não autenticado ou sem permissão" });
    }

    try {
      const lastLog = await this.logService.getLastLogByNgoId(request.user.ngoId);
      reply.send(lastLog ? [lastLog] : []);
    } catch (error) {
      console.error("Erro ao obter último log:", error);
      reply.status(500).send({ error: "Erro ao obter último log" });
    }
  }

  // Método para usar o ngoId do token
  async getOngLogs(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user || !request.user.ngoId) {
      return reply.status(401).send({ error: "Usuário não autenticado ou sem permissão" });
    }

    try {
      const logs = await this.logService.getLogsByNgoId(request.user.ngoId);
      reply.send(logs);
    } catch (error) {
      console.error("Erro ao obter logs da ONG:", error);
      reply.status(500).send({ error: "Erro ao obter logs da ONG" });
    }

  }
}

export { LogController };