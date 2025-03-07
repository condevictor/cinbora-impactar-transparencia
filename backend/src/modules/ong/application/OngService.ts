import { Ong, OngProps, OngRepository } from "@modules/ong";

class GetOngUseCase {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(): Promise<Ong[]> {
    return this.ongRepository.findAll();
  }

  async executeById(id: string): Promise<Ong | null> {
    return this.ongRepository.findById(id);
  }

  async getGraficByNgoId(ngoId: string): Promise<any> {
    return this.ongRepository.findGraficByNgoId(ngoId);
  }
}

class CreateOngUseCase {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(data: OngProps): Promise<Ong> {
    const ong = new Ong(data);
    return this.ongRepository.create(ong);
  }
}

interface DeleteOngProps {
  id: string;
}

class DeleteOngUseCase {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute({ id }: DeleteOngProps): Promise<void> {
    const ngoId = id;

    const ngo = await this.ongRepository.findById(ngoId);

    if (!ngo) {
      throw new Error("ONG não encontrada");
    }

    // Excluir a ONG e todos os usuários associados
    await this.ongRepository.delete(ngoId);
  }
}

class UpdateOngUseCase {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(ngoId: number, data: Partial<OngProps>): Promise<OngProps> {
    return this.ongRepository.update(ngoId, data);
  }
}

class UpdateNgoGraficUseCase {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(ngoId: number, data: Partial<{ totalExpenses: number; expensesByCategory: Record<string, number> }>): Promise<any> {
    return this.ongRepository.updateNgoGrafic(ngoId, data);
  }
}

export { CreateOngUseCase, GetOngUseCase, DeleteOngUseCase, UpdateOngUseCase, UpdateNgoGraficUseCase };