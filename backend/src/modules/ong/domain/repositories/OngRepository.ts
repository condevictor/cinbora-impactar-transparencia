import prismaClient from "@shared/prismaClient";
import { Ong, OngProps } from "@modules/ong";

class OngRepository {
  async findById(id: string): Promise<Ong | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId) || numericId <= 0) {
      throw new Error('ID inválido');
    }

    const ong = await prismaClient.ngo.findUnique({ where: { id: numericId } });

    if (!ong) return null;

    return new Ong(ong, ong.id);
  }

  async findAll(): Promise<Ong[]> {
    const ongs = await prismaClient.ngo.findMany();
    return ongs.map(ong => new Ong(ong, ong.id));
  }

  async create(data: Ong): Promise<Ong> {
    try {
      const ong = await prismaClient.$transaction(async (prisma) => {
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

        await prisma.ngoGraphic.create({
          data: {
            ngoId: data.id,
            totalExpenses: 0,
            expensesByCategory: [{}],
          },
        });

        return new Ong(ong, ong.id);
      });

      return ong;
    } catch (error) {
      console.error("Error creating ONG:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId) || numericId <= 0) {
      throw new Error('ID inválido');
    }

    try {
      await prismaClient.$transaction(async (prisma) => {
        await prisma.actionExpensesGrafic.deleteMany({
          where: { ngoId: numericId },
        });

        await prisma.actionFile.deleteMany({
          where: { ngoId: numericId },
        });

        await prisma.action.deleteMany({
          where: { ngoId: numericId },
        });

        await prisma.user.deleteMany({
          where: { ngoId: numericId },
        });

        await prisma.ongFile.deleteMany({
          where: { ngoId: numericId },
        });

        await prisma.ngoGraphic.deleteMany({
          where: { ngoId: numericId },
        });

        await prisma.ngo.delete({ where: { id: numericId } });
      });
    } catch (error) {
      console.error("Error deleting ONG:", error);
      throw error;
    }
  }

  async update(ngoId: number, data: Partial<OngProps>): Promise<OngProps> {
    const existingNgo = await prismaClient.ngo.findUnique({ where: { id: ngoId } });

    if (!existingNgo) {
      throw new Error('ONG não encontrada');
    }

    const updatedOng = await prismaClient.ngo.update({
      where: { id: ngoId },
      data,
    });
    return updatedOng;
  }

  async updateNgoGrafic(ngoId: number, data: Partial<{ totalExpenses: number; expensesByCategory: Record<string, number> }>): Promise<any> {
    const existingGrafic = await prismaClient.ngoGraphic.findUnique({ where: { ngoId } });

    if (!existingGrafic) {
      throw new Error('Gráfico não encontrado');
    }

    const updatedExpensesByCategory = {
      ...data.expensesByCategory,
    };

    const updatedGrafic = await prismaClient.ngoGraphic.update({
      where: { ngoId },
      data: {
        totalExpenses: data.totalExpenses ?? existingGrafic.totalExpenses,
        expensesByCategory: updatedExpensesByCategory,
      },
    });

    return updatedGrafic;
  }

  async findGraficByNgoId(ngoId: string): Promise<any> {
    return prismaClient.ngoGraphic.findFirst({
      where: { ngoId: parseInt(ngoId) },
    });
  }
}

export { OngRepository };
