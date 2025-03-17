import { OngRepository } from "@modules/ong";

interface DeleteOngProps {
  id: string;
}

class DeleteOngService {
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

export { DeleteOngService };
