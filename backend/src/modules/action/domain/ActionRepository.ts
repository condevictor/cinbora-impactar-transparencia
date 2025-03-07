import prismaClient from "@shared/prismaClient";
import { Action } from "@modules/action";

class ActionRepository {
  async findById(id: string): Promise<Action | null > {
    const action = await prismaClient.action.findUnique({
      where: { id },
    });

    if (!action) return null ;

    return new Action(action, action.id)
  }

  async findByNgoId(ngoId: string): Promise<Action[]> {
    const actions = await prismaClient.action.findMany({
      where: { ngoId: parseInt(ngoId) },
    });
    return actions.map(action => new Action(action, action.id));
  }

  async findByNgoIdAndActionId(ngoId: string, actionId: string): Promise<Action | null> {
    const action = await prismaClient.action.findUnique({
      where: { id: actionId, ngoId: parseInt(ngoId) },
    });

    if (!action) return null;

    return new Action(action, action.id)
  }

  async findAll(): Promise<Action[]> {
    const actions = await prismaClient.action.findMany();
    return actions.map(action => new Action(action, action.id));
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
          },
        });

        await prisma.actionExpensesGrafic.create({
          data: {
            actionId: createdAction.id,
            ngoId: data.ngoId,
            categorysExpenses: {},
          },
        });

        return createdAction;
      });

      return new Action(action, action.id);
    } catch (error) {
      console.error("Error creating action:", error);
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<Action, 'id'>>): Promise<Action> {
    try {
      const updatedAction = await prismaClient.action.update({
        where: { id },
        data: data,
      });

      return new Action(updatedAction, updatedAction.id);
    } catch (error) {
      console.error("Error updating action:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await prismaClient.$transaction(async (prisma) => {
        await prisma.actionExpensesGrafic.deleteMany({
          where: { actionId: id },
        });

        await prisma.action.delete({
          where: { id },
        });
      });
    } catch (error) {
      console.error("Error deleting action:", error);
      throw error;
    }
  }

  async updateActionExpensesGrafic(actionId: string, data: Partial<{ categorysExpenses: Record<string, number> }>): Promise<any> {
    const existingGrafic = await prismaClient.actionExpensesGrafic.findFirst({ where: { actionId } });
  
    if (!existingGrafic) {
      throw new Error('Gráfico não encontrado');
    }
  
    const updatedCategorysExpenses = {
      ...(existingGrafic.categorysExpenses as Record<string, number>),
      ...data.categorysExpenses,
    };
  
    const updatedGrafic = await prismaClient.actionExpensesGrafic.update({
      where: { id: existingGrafic.id },
      data: {
        categorysExpenses: updatedCategorysExpenses,
      },
    });
  
    return updatedGrafic;
  }

  async findExpensesByActionId(actionId: string): Promise<any> {
    return prismaClient.actionExpensesGrafic.findFirst({
      where: { actionId },
    });
  }
}

export { ActionRepository };