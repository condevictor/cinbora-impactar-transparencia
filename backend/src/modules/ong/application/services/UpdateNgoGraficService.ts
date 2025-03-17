import { OngRepository } from "@modules/ong";

class UpdateNgoGraficService {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(ngoId: number, data: Partial<{ totalExpenses: number; expensesByCategory: Record<string, number> }>): Promise<any> {
    return this.ongRepository.updateNgoGrafic(ngoId, data);
  }
}

export { UpdateNgoGraficService };
