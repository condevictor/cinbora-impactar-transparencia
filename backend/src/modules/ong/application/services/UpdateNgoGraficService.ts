import { OngRepository } from "@modules/ong";
import { CustomError } from "@shared/customError";

class UpdateNgoGraficService {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(ngoId: number, data: Partial<{ totalExpenses: number; expensesByCategory: Record<string, number> }>): Promise<any> {
    try {
      return this.ongRepository.updateNgoGrafic(ngoId, data);
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar gráfico da ONG", 500);
    }
  }
}

export { UpdateNgoGraficService };