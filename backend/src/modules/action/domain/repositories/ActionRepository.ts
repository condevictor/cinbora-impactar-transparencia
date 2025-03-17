import prismaClient from "@shared/prismaClient";
import { Action } from "@modules/action";
import s3StorageInstance from "@shared/s3Cliente";
import { CustomError } from "@shared/customError";
import { Prisma } from "@prisma/client";
import { NgoExpensesGrafic } from "@routeParams/RouteParams"

class ActionRepository {
  private s3Storage = s3StorageInstance;

  async findById(id: string): Promise<Action | null> {
    try {
      const action = await prismaClient.action.findUnique({
        where: { id },
      });

      if (!action) return null;

      return new Action(action, action.id);
    } catch (error) {
      console.error("Erro ao buscar ação por ID:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar ação por ID", 400);
      }
      throw new CustomError("Erro ao buscar ação", 500);
    }
  }

  async findByNgoId(ngoId: string): Promise<Action[]> {
    try {
      const actions = await prismaClient.action.findMany({
        where: { ngoId: parseInt(ngoId) },
      });
      return actions.map(action => new Action(action, action.id));
    } catch (error) {
      console.error("Erro ao buscar ações por ONG ID:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar ações por ONG ID", 400);
      }
      throw new CustomError("Erro ao buscar ações por ONG ID", 500);
    }
  }

  async findByNgoIdAndActionId(ngoId: string, actionId: string): Promise<Action | null> {
    try {
      const action = await prismaClient.action.findUnique({
        where: { id: actionId, ngoId: parseInt(ngoId) },
      });

      if (!action) return null;

      return new Action(action, action.id);
    } catch (error) {
      console.error("Erro ao buscar ação por ONG ID e Ação ID:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar ação por ONG ID e Ação ID", 400);
      }
      throw new CustomError("Erro ao buscar ação por ONG ID e Ação ID", 500);
    }
  }

  async findAll(): Promise<Action[]> {
    try {
      const actions = await prismaClient.action.findMany();
      return actions.map(action => new Action(action, action.id));
    } catch (error) {
      console.error("Erro ao buscar todas as ações:", error);
      throw new CustomError("Erro ao buscar todas as ações", 500);
    }
  }

  async create(data: Omit<Action, 'id'>): Promise<Action> {
    try {
      const action = await prismaClient.$transaction(async (prisma) => {
        const createdAction = await prisma.action.create({
          data: {
            name: data.name,
            type: data.type,
            ngoId: data.ngoId,
            spent: data.spent,
            goal: data.goal,
            colected: data.colected,
            aws_url: data.aws_url,
          },
        });

        await prisma.actionExpensesGrafic.create({
          data: {
            actionId: createdAction.id,
            ngoId: data.ngoId,
            categorysExpenses: [{}],
          },
        });

        return createdAction;
      });

      return new Action(action, action.id);
    } catch (error) {
      console.error("Erro ao criar ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao criar ação", 400);
      }
      throw new CustomError("Erro ao criar ação", 500);
    }
  }

  async update(id: string, data: Partial<Omit<Action, 'id'>>): Promise<Action> {
    try {
      const updatedAction = await prismaClient.action.update({
        where: { id },
        data,
      });

      return new Action(updatedAction, updatedAction.id);
    } catch (error) {
      console.error("Erro ao atualizar ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao atualizar ação", 400);
      }
      throw new CustomError("Erro ao atualizar ação", 500);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prismaClient.$transaction(async (prisma) => {
        const action = await prisma.action.findUnique({
          where: { id },
          include: {
            files: true,
            expenses: true,
          },
        });

        if (!action) {
          throw new CustomError("Ação não encontrada", 404);
        }

        for (const file of action.files) {
          await this.s3Storage.deleteFile(file.aws_name);
        }

        const actionFileName = action.aws_url.split('/').pop();
        if (actionFileName) {
          await this.s3Storage.deleteFile(actionFileName);
        }

        await prisma.actionFile.deleteMany({
          where: { actionId: id },
        });
        await prisma.actionExpensesGrafic.deleteMany({
          where: { actionId: id },
        });
        await prisma.action.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.error("Erro ao deletar ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao deletar ação", 400);
      }
      throw new CustomError("Erro ao deletar ação", 500);
    }
  }

  async updateActionExpensesGrafic(actionId: string, newExpense: Record<string, number>): Promise<NgoExpensesGrafic> {
    try {
      const existingExpenses = await prismaClient.actionExpensesGrafic.findFirst({
        where: { actionId },
      });

      if (!existingExpenses) {
        throw new CustomError("Registro de despesas não encontrado", 404);
      }

      const updatedExpenses = [...(existingExpenses.categorysExpenses as Record<string, number>[]), newExpense];

      const updatedGrafic = await prismaClient.actionExpensesGrafic.update({
        where: { id: existingExpenses.id },
        data: {
          categorysExpenses: updatedExpenses,
        },
      });

      const lastExpense = updatedExpenses[updatedExpenses.length - 1] || {};
      const totalSpent = Object.values(lastExpense).reduce((sum: number, amount: number) => 
        typeof amount === 'number' ? sum + amount : sum, 0
      );

      await prismaClient.action.update({
        where: { id: actionId },
        data: { spent: totalSpent }
      });

      const action = await prismaClient.action.findUnique({
        where: { id: actionId },
        include: { ngo: true }
      });

      if (action && action.ngo) {
        const ngoId = action.ngo.id;

        const actions = await prismaClient.action.findMany({
          where: { ngoId }
        });

        const totalExpenses = actions.reduce((sum, act) => sum + act.spent, 0);
        const expensesByCategory = actions.reduce((acc, act) => {
          acc[act.name] = act.spent;
          return acc;
        }, {} as Record<string, number>);

        const ngoGraphic = await prismaClient.ngoGraphic.findUnique({
          where: { ngoId }
        });

        if (ngoGraphic) {
          const updatedExpensesByCategory = [
            ...(Array.isArray(ngoGraphic.expensesByCategory) ? ngoGraphic.expensesByCategory : []),
            expensesByCategory
          ];

          await prismaClient.ngoGraphic.update({
            where: { ngoId },
            data: {
              totalExpenses,
              expensesByCategory: updatedExpensesByCategory,
            }
          });
        }
      }

      return updatedGrafic;
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 400);
      }
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }

  async findExpensesByActionId(actionId: string): Promise<NgoExpensesGrafic | null> {
    try {
      return prismaClient.actionExpensesGrafic.findFirst({
        where: { actionId },
      });
    } catch (error) {
      console.error("Erro ao buscar despesas por ID da ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao buscar despesas por ID da ação", 400);
      }
      throw new CustomError("Erro ao buscar despesas por ID da ação", 500);
    }
  }
}

export { ActionRepository };