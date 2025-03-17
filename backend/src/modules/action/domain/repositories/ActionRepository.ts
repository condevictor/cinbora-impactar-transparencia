import prismaClient from "@shared/prismaClient";
import { Action } from "@modules/action";
import s3StorageInstance from "@shared/s3Cliente";

class ActionRepository {
  private s3Storage = s3StorageInstance;

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
            aws_url: data.aws_url, // Adicionando aws_url
          },
        });

        await prisma.actionExpensesGrafic.create({
          data: {
            actionId: createdAction.id,
            ngoId: data.ngoId,
            categorysExpenses: [{}], // Inicializa com um JSON vazio
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
        const action = await prisma.action.findUnique({
          where: { id },
          include: {
            files: true,
            expenses: true,
          },
        });

        if (!action) {
          throw new Error("Action not found");
        }

        // Delete related files from S3
        for (const file of action.files) {
          await this.s3Storage.deleteFile(file.aws_name);
        }

        // Delete the main action file from S3
        const actionFileName = action.aws_url.split('/').pop();
        if (actionFileName) {
          await this.s3Storage.deleteFile(actionFileName);
        }

        // Delete related records from the database
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
      console.error("Error deleting action:", error);
      throw error;
    }
  }

  async updateActionExpensesGrafic(actionId: string, newExpense: Record<string, number>): Promise<any> {
    // 1. Busca o registro existente
    const existingExpenses = await prismaClient.actionExpensesGrafic.findFirst({
      where: { actionId },
    });
  
    if (!existingExpenses) {
      throw new Error("Registro de despesas não encontrado");
    }
  
    // 2. Adiciona o novo JSON ao array existente
    const updatedExpenses = [...(existingExpenses.categorysExpenses as any[]), newExpense];
  
    // 3. Atualiza o registro no banco de dados
    const updatedGrafic = await prismaClient.actionExpensesGrafic.update({
      where: { id: existingExpenses.id },
      data: {
        categorysExpenses: updatedExpenses, // Não é necessário cast
      },
    });
  
    // Atualiza o campo spent da Action
    const totalSpent = updatedExpenses.reduce((sum: number, exp: any, index: number, array: any[]) => {
      if (exp && typeof exp === 'object' && !Array.isArray(exp)) {
        const previousExp = array[index - 1] || {};
        return sum + Object.entries(exp).reduce((acc: number, [category, amount]: [string, any]) => {
          if (typeof amount === 'number') {
            const previousAmount = previousExp[category] || 0;
            return acc + (amount - previousAmount);
          }
          return acc;
        }, 0);
      }
      return sum;
    }, 0);
  
    await prismaClient.action.update({
      where: { id: actionId },
      data: { spent: totalSpent }
    });
  
    // Atualiza os campos totalExpenses e expensesByCategory do NgoGraphic
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
            expensesByCategory: updatedExpensesByCategory, // Atualiza com os gastos de todas as ações
          }
        });
      }
    }
  
    return updatedGrafic;
  }

  async findExpensesByActionId(actionId: string): Promise<any> {
    return prismaClient.actionExpensesGrafic.findFirst({
      where: { actionId },
    });
  }
}

export { ActionRepository };
