import { OngRepository } from "@modules/ong";
import { CustomError } from "@shared/customError";

interface DeleteOngProps {
  id: string;
}

class DeleteOngService {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute({ id }: DeleteOngProps): Promise<void> {
    try {
      const ngoId = id;
      const ngo = await this.ongRepository.findById(ngoId);
      if (!ngo) {
        throw new CustomError("ONG não encontrada", 404);
      }
      await this.ongRepository.delete(ngoId);
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao deletar ONG", 500);
    }
  }
}

export { DeleteOngService };