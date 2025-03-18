import { FastifyRequest, FastifyReply } from "fastify";
import { OngProps, GetOngService, CreateOngService, DeleteOngService, UpdateOngService, UpdateNgoGraficService } from "@modules/ong";
import { getOngService, deleteOngService, createOngService, updateOngService, updateNgoGraficService } from "@config/dependencysInjection/ongDependencyInjection";
import { logService } from "@config/dependencysInjection/logDependencyInjection";
import { CustomError } from "@shared/customError";

class OngController {
  private getOngService: GetOngService;
  private deleteOngService: DeleteOngService;
  private createOngService: CreateOngService;
  private updateOngService: UpdateOngService;
  private updateNgoGraficService: UpdateNgoGraficService;

  constructor() {
    this.getOngService = getOngService;
    this.deleteOngService = deleteOngService;
    this.createOngService = createOngService;
    this.updateOngService = updateOngService;
    this.updateNgoGraficService = updateNgoGraficService;
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ngos = await this.getOngService.execute();
      reply.send(ngos);
    } catch (error) {
      console.error("Erro ao obter ONGs:", error);
      reply.status(500).send({ error: "Erro ao obter ONGs" });
    }
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const ngo = await this.getOngService.executeById(id);
      reply.send(ngo);
    } catch (error) {
      console.error("Erro ao obter ONG:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao obter ONG" });
      }
    }
  }

  async getOneWithGrafic(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const ngo = await this.getOngService.executeById(id);
      const ngoGrafic = await this.getOngService.getGraficByNgoId(id);
      reply.send({ ngo, ngoGrafic });
    } catch (error) {
      console.error("Erro ao obter ONG com gráfico:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao obter ONG com gráfico" });
      }
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as Partial<OngProps>;
    try {
      if (!request.user) {
        reply.status(400).send({ error: "Usuário não autenticado" });
        return;
      }
      const updatedOng = await this.updateOngService.execute(request.user.ngoId, data);
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "ATUALIZAR", "ONG", request.user.ngoId.toString(), data, "ONG atualizada");
      reply.send({ message: "ONG atualizada com sucesso", ngo: updatedOng });
    } catch (error) {
      console.error("Erro ao atualizar ONG:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao atualizar ONG" });
      }
    }
  }

  async updateNgoGrafic(request: FastifyRequest, reply: FastifyReply) {
    const { totalExpenses, expensesByCategory } = request.body as {
      totalExpenses?: number;
      expensesByCategory?: Record<string, number>;
    };
    try {
      if (!request.user) {
        reply.status(400).send({ error: "Usuário não autenticado" });
        return;
      }
      const updatedGrafic = await this.updateNgoGraficService.execute(request.user.ngoId, { totalExpenses, expensesByCategory });
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "ATUALIZAR", "Gráfico ONG", request.user.ngoId.toString(), { totalExpenses, expensesByCategory }, "Gráfico da ONG atualizado");
      reply.send(updatedGrafic);
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao atualizar gráfico da ONG" });
      }
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    const { id } = request.params as { id: string };
    try {
      await this.deleteOngService.execute({ id });
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "DELETAR", "ONG", id, {}, "ONG deletada");
      reply.send({ message: "ONG deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao deletar ONG" });
      }
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    const data = request.body as OngProps;
    try {
      const ong = await this.createOngService.execute(data);
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "CRIAR", "ONG", ong.id.toString(), data, "ONG criada");
      reply.status(201).send(ong);
    } catch (error) {
      console.error("Erro ao criar ONG:", error);
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao criar ONG" });
      }
    }
  }
}

export { OngController };