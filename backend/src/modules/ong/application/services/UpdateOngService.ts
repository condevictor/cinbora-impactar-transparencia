import { OngProps, OngRepository } from "@modules/ong";

class UpdateOngService {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(ngoId: number, data: Partial<OngProps>): Promise<OngProps> {
    return this.ongRepository.update(ngoId, data);
  }
}

export { UpdateOngService };
