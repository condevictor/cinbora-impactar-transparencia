import { FastifyRequest, FastifyReply } from "fastify";
import { GetOngUseCase, DeleteOngUseCase, CreateOngUseCase, OngRepository, UpdateOngUseCase, UpdateNgoGraficUseCase, OngProps } from "@modules/ong";

class OngController {
  private getOngUseCase: GetOngUseCase;
  private deleteOngUseCase: DeleteOngUseCase;
  private createOngUseCase: CreateOngUseCase;
  private updateOngUseCase: UpdateOngUseCase;
  private updateNgoGraficUseCase: UpdateNgoGraficUseCase;

  constructor() {
    const ongRepository = new OngRepository();
    this.getOngUseCase = new GetOngUseCase(ongRepository);
    this.deleteOngUseCase = new DeleteOngUseCase(ongRepository);
    this.createOngUseCase = new CreateOngUseCase(ongRepository);
    this.updateOngUseCase = new UpdateOngUseCase(ongRepository);
    this.updateNgoGraficUseCase = new UpdateNgoGraficUseCase(ongRepository);
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ngos = await this.getOngUseCase.execute();
      reply.send(ngos);
    } catch (error) {
      console.error("Erro ao obter ONGs:", error);
      reply.status(500).send({ error: "Erro ao obter ONGs" });
    }
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const ngo = await this.getOngUseCase.executeById(id);
      reply.send(ngo);
    } catch (error) {
      console.error("Erro ao obter ONG:", error);
      reply.status(500).send({ error: "Erro ao obter ONG" });
    }
  }

  async getOneWithGrafic(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      const ngo = await this.getOngUseCase.executeById(id);
      if (!ngo) {
        reply.status(404).send({ error: "ONG não encontrada" });
        return;
      }
      const ngoGrafic = await this.getOngUseCase.getGraficByNgoId(id);
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
      const updatedOng = await this.updateOngUseCase.execute(request.user.ngoId, data);
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
      const updatedGrafic = await this.updateNgoGraficUseCase.execute(request.user.ngoId, { totalExpenses, expensesByCategory });
      reply.send(updatedGrafic);
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG:", error);
      reply.status(500).send({ error: "Erro ao atualizar gráfico da ONG" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    try {
      await this.deleteOngUseCase.execute({ id });
      reply.send({ message: "ONG deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      reply.status(500).send({ error: "Erro ao deletar ONG" });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as OngProps;

    try {
      const ong = await this.createOngUseCase.execute(data);
      reply.send(ong);
    } catch (error) {
      console.error("Erro ao criar ONG:", error);
      reply.status(500).send({ error: "Erro ao criar ONG" });
    }
  }
}

export { OngController };