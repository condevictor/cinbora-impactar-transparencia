import { Ong, OngProps, OngRepository } from "@modules/ong";

class CreateOngService {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(data: OngProps): Promise<Ong> {
    const ong = new Ong(data);
    return this.ongRepository.create(ong);
  }
}

export { CreateOngService };