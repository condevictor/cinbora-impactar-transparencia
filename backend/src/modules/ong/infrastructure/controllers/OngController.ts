import { FastifyRequest, FastifyReply } from "fastify";
import { OngProps, GetOngService, CreateOngService, DeleteOngService, UpdateOngService, UpdateNgoGraficService } from "@modules/ong";
import { getOngService, deleteOngService, createOngService, updateOngService, updateNgoGraficService } from "@config/dependencysInjection/ongDependencyInjection";

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

  async getAll(request: FastifyRequest) {
    try {
      const ngos = await this.getOngService.execute();
      return ngos; 
    } catch (error) {
      console.error("Erro ao obter ONGs:", error);
      throw new Error("Erro ao obter ONGs"); 
    }
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const ngo = await this.getOngService.executeById(id);
      reply.send(ngo);
    } catch (error) {
      console.error("Erro ao obter ONG:", error);
      reply.status(500).send({ error: "Erro ao obter ONG" });
    }
  }

  async getOneWithGrafic(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const ngo = await this.getOngService.executeById(id);
      if (!ngo) {
        reply.status(404).send({ error: "ONG não encontrada" });
        return;
      }
      const ngoGrafic = await this.getOngService.getGraficByNgoId(id);
      reply.send({ ngo, ngoGrafic });
    } catch (error) {
      console.error("Erro ao obter ONG:", error);
      reply.status(500).send({ error: "Erro ao obter ONG" });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as Partial<OngProps>;

    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    try {
      const updatedOng = await this.updateOngService.execute(request.user.ngoId, data);
      reply.send({ message: "ONG atualizada com sucesso", ngo: updatedOng });
    } catch (error) {
      console.error("Erro ao atualizar ONG:", error);
      reply.status(500).send({ error: "Erro ao atualizar ONG" });
    }
  }

  async updateNgoGrafic(request: FastifyRequest, reply: FastifyReply) {
    const { totalExpenses, expensesByCategory } = request.body as {
      totalExpenses?: number;
      expensesByCategory?: Record<string, number>;
    };

    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }

    try {
      const updatedGrafic = await this.updateNgoGraficService.execute(request.user.ngoId, { totalExpenses, expensesByCategory });
      reply.send(updatedGrafic);
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG:", error);
      reply.status(500).send({ error: "Erro ao atualizar gráfico da ONG" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      await this.deleteOngService.execute({ id });
      reply.send({ message: "ONG deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      reply.status(500).send({ error: "Erro ao deletar ONG" });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as OngProps;

    try {
      const ong = await this.createOngService.execute(data);
      reply.send(ong);
    } catch (error) {
      console.error("Erro ao criar ONG:", error);
      reply.status(500).send({ error: "Erro ao criar ONG" });
    }
  }
}

export { OngController };