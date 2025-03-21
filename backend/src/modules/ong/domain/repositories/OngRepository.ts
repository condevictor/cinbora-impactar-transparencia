import prismaClient from "@shared/prismaClient";
import { Ong, OngProps } from "@modules/ong";
import { CustomError } from "@shared/customError";
import { Prisma } from "@prisma/client";

class OngRepository {
  async findById(id: string): Promise<Ong | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId) || numericId <= 0) {
      throw new CustomError('ID inválido', 400);
    }

    try {
      const ong = await prismaClient.ngo.findUnique({ where: { id: numericId } });
      if (!ong) return null;
      return new Ong(ong, ong.id);
    } catch (error) {
      console.error("Erro ao buscar ONG por ID:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar ONG por ID", 400);
      }
      throw new CustomError("Erro ao buscar ONG", 500);
    }
  }

  async findAll(): Promise<Ong[]> {
    try {
      const ongs = await prismaClient.ngo.findMany();
      return ongs.map(ong => new Ong(ong, ong.id));
    } catch (error) {
      console.error("Erro ao buscar todas as ONGs:", error);
      throw new CustomError("Erro ao buscar todas as ONGs", 500);
    }
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
            expensesByAction: [],
          },
        });

        return new Ong(ong, ong.id);
      });

      return ong;
    } catch (error) {
      console.error("Erro ao criar ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao criar ONG", 400);
      }
      throw new CustomError("Erro ao criar ONG", 500);
    }
  }

  async delete(id: string): Promise<void> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(numericId) || numericId <= 0) {
      throw new CustomError('ID inválido', 400);
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
      console.error("Erro ao deletar ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao deletar ONG", 400);
      }
      throw new CustomError("Erro ao deletar ONG", 500);
    }
  }

  async update(ngoId: number, data: Partial<OngProps>): Promise<OngProps> {
    const existingNgo = await prismaClient.ngo.findUnique({ where: { id: ngoId } });

    if (!existingNgo) {
      throw new CustomError('ONG não encontrada', 404);
    }

    try {
      const updatedOng = await prismaClient.ngo.update({
        where: { id: ngoId },
        data,
      });
      return updatedOng;
    } catch (error) {
      console.error("Erro ao atualizar ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao atualizar ONG", 400);
      }
      throw new CustomError("Erro ao atualizar ONG", 500);
    }
  }

  async updateNgoGrafic(ngoId: number, data: Partial<{ totalExpenses: number; expensesByCategory: Record<string, number> }>): Promise<any> {
    const existingGrafic = await prismaClient.ngoGraphic.findUnique({ where: { ngoId } });

    if (!existingGrafic) {
      throw new CustomError('Gráfico não encontrado', 404);
    }

    const updatedExpensesByCategory = {
      ...data.expensesByCategory,
    };

    try {
      const updatedGrafic = await prismaClient.ngoGraphic.update({
        where: { ngoId },
        data: {
          totalExpenses: data.totalExpenses ?? existingGrafic.totalExpenses,
          expensesByAction: updatedExpensesByCategory,
        },
      });

      return updatedGrafic;
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao atualizar gráfico da ONG", 400);
      }
      throw new CustomError("Erro ao atualizar gráfico da ONG", 500);
    }
  }

  async findGraficByNgoId(ngoId: string): Promise<any> {
    try {
      return prismaClient.ngoGraphic.findFirst({
        where: { ngoId: parseInt(ngoId) },
      });
    } catch (error) {
      console.error("Erro ao obter gráfico da ONG:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao obter gráfico da ONG", 400);
      }
      throw new CustomError("Erro ao obter gráfico da ONG", 500);
    }
  }
}

export { OngRepository };