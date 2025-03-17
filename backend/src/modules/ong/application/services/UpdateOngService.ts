import { OngProps, OngRepository } from "@modules/ong";
import { CustomError } from "@shared/customError";

class UpdateOngService {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }
  async execute(ngoId: number, data: Partial<OngProps>): Promise<OngProps> {
    try {
      return this.ongRepository.update(ngoId, data);
    } catch (error) {
      console.error("Erro no serviço de atualizar ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro no serviço de atualizar ONG", 500);
    }
  }
}

export { UpdateOngService };