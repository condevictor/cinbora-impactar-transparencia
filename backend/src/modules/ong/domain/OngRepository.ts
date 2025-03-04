import prismaClient from "@config/prismaClient";
import { Ong } from "./OngEntity";

class OngRepository {
  async findById(id: number): Promise<Ong | null> {
    const ong = await prismaClient.ngo.findUnique({ where: { id } });
    if (!ong) return null;
    return new Ong(ong, ong.id);
  }

  async findAll(): Promise<Ong[]> {
    const ongs = await prismaClient.ngo.findMany();
    return ongs.map(ong => new Ong(ong, ong.id));
  }

  async create(data: Ong): Promise<Ong> {
    const ong = await prismaClient.ngo.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        is_formalized: data.is_formalized,
        start_year: data.start_year,
        contact_phone: data.contact_phone,
        instagram_link: data.instagram_link,
        x_link: data.x_link,
        facebook_link: data.facebook_link,
        pix_qr_code_link: data.pix_qr_code_link,
        site: data.site,
        gallery_images_url: data.gallery_images_url,
        skills: data.skills, 
        causes: data.causes, 
        sustainable_development_goals: data.sustainable_development_goals,
      },
    });
    return new Ong(ong, ong.id);
  }

  async delete(id: number): Promise<void> {
    await prismaClient.user.deleteMany({
      where: { ngoId: id },
    });
    await prismaClient.ngo.delete({ where: { id } });
  }
}

export { OngRepository };