import { Ong, OngRepository } from "@modules/ong";
import { CustomError } from "@shared/customError";

class GetOngService {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(): Promise<Ong[]> {
    try {
      return this.ongRepository.findAll();
    } catch (error) {
      console.error("Erro ao obter ONGs:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter ONGs", 500);
    }
  }

  async executeById(id: string): Promise<Ong | null> {
    try {
      const ngo = await this.ongRepository.findById(id);
      if (!ngo) {
        throw new CustomError("ONG não encontrada", 404);
      }
      return ngo;
    } catch (error) {
      console.error("Erro ao obter ONG por ID:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter ONG por ID", 500);
    }
  }

  async getGraficByNgoId(ngoId: string): Promise<any> {
    try {
      return this.ongRepository.findGraficByNgoId(ngoId);
    } catch (error) {
      console.error("Erro ao obter gráfico da ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter gráfico da ONG", 500);
    }
  }
}

export { GetOngService };