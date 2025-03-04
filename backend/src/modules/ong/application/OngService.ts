import { OngRepository } from "../domain/OngRepository";
import { Ong } from "../domain/OngEntity";

class GetOngUseCase {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(): Promise<Ong[]> {
    return this.ongRepository.findAll();
  }

  async executeById(id: number): Promise<Ong | null> {
    return this.ongRepository.findById(id);
  }
}

interface CreateOngProps {
  id: number;
  name: string;
  description: string;
  is_formalized: boolean;
  start_year: number;
  contact_phone: string;
  instagram_link: string;
  x_link: string;
  facebook_link: string;
  pix_qr_code_link: string;
  site: string;
  gallery_images_url: string[];
  skills: Skill[];
  causes: Cause[];
  sustainable_development_goals: SustainableDevelopmentGoal[];
}

class CreateOngUseCase {
  private ongRepository: OngRepository;

  constructor(ongRepository: OngRepository) {
    this.ongRepository = ongRepository;
  }

  async execute(data: CreateOngProps): Promise<Ong> {
    const ong = new Ong(data);
    return this.ongRepository.create(ong);
  }
}

interface DeleteOngProps {
  id: number;
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

export { CreateOngUseCase, GetOngUseCase, DeleteOngUseCase };