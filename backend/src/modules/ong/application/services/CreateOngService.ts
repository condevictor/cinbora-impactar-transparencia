import { Ong, OngProps, OngRepository } from "@modules/ong";
import { CustomError } from "@shared/customError";

class CreateOngService {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(data: OngProps): Promise<Ong> {
    try {
      const ong = new Ong(data);
      return this.ongRepository.create(ong);
    } catch (error) {
      console.error("Erro ao criar ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao criar ONG", 500);
    }
  }
}

export { CreateOngService };