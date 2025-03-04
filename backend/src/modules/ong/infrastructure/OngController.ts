import { FastifyRequest, FastifyReply } from "fastify";
import { GetOngUseCase, DeleteOngUseCase, CreateOngUseCase } from "../application/OngService";
import { OngRepository } from "../domain/OngRepository";

class OngController {
  private getOngUseCase: GetOngUseCase;
  private deleteOngUseCase: DeleteOngUseCase;
  private createOngUseCase: CreateOngUseCase;

  constructor() {
    const ongRepository = new OngRepository();
    this.getOngUseCase = new GetOngUseCase(ongRepository);
    this.deleteOngUseCase = new DeleteOngUseCase(ongRepository);
    this.createOngUseCase = new CreateOngUseCase(ongRepository);
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

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: number };
    try {
      await this.deleteOngUseCase.execute({ id });
      reply.send({ message: "ONG deletada com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      reply.status(500).send({ error: "Erro ao deletar ONG" });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as {
      id: number;
      name: string;
      description: string;
      is_formalized: boolean;
      start_year: number;
      contact_phone: string;
      instagram_link: string;
      x_link: string;
      facebook_link: string;
      pix_qr_code_link: string;
      site: string;
      gallery_images_url: string[];
      skills: Skill[];
      causes: Cause[];
      sustainable_development_goals: SustainableDevelopmentGoal[];
    };

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