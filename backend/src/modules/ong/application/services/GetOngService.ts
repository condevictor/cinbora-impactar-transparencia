import { Ong, OngRepository } from "@modules/ong";

class GetOngService {
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

export { GetOngService };
