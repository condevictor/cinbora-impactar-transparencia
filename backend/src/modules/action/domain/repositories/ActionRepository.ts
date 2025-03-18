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
            categorysExpenses: [],
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

  

  async updateActionExpensesGrafic(actionId: string, newExpense: Record<string, number>): Promise<any> {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
  
      // Função auxiliar para encontrar último registro de categorias
      const findLatestCategoriesExpenses = (expensesArr: any[]): Record<string, number> => {
        if (!expensesArr || expensesArr.length === 0) return {};
        
        // Percorrer a estrutura para encontrar o último registro
        for (let i = expensesArr.length - 1; i >= 0; i--) {
          const yearData = expensesArr[i];
          if (!yearData.months || yearData.months.length === 0) continue;
          
          for (let j = yearData.months.length - 1; j >= 0; j--) {
            const monthData = yearData.months[j];
            if (!monthData.dailyRecords || monthData.dailyRecords.length === 0) continue;
            
            for (let k = monthData.dailyRecords.length - 1; k >= 0; k--) {
              const dayRecord = monthData.dailyRecords[k];
              if (dayRecord?.categorysExpenses) {
                return dayRecord.categorysExpenses as Record<string, number>;
              }
            }
          }
        }
        
        return {};
      };
  
      const existingExpenses = await prismaClient.actionExpensesGrafic.findFirst({
        where: { actionId },
      });
  
      let expensesArray: any[] = [];
  
      if (existingExpenses) {
        expensesArray = existingExpenses.categorysExpenses as Array<any>;
        let yearData = expensesArray.find((entry: any) => entry.year === year);
  
        if (!yearData) {
          yearData = { year, months: [] };
          expensesArray.push(yearData);
        }
  
        let monthData = yearData.months.find((m: any) => m.month === month);
  
        if (!monthData) {
          monthData = { month, dailyRecords: [] };
          yearData.months.push(monthData);
        }
  
        let dayData = monthData.dailyRecords.find((d: any) => d.day === day);
  
        if (dayData) {
          // Atualiza as categorias mantendo as existentes e substituindo os valores enviados
          dayData.categorysExpenses = { ...dayData.categorysExpenses, ...newExpense };
        } else {
          // Encontrar o último registro com categorias para herdar
          const latestCategories = findLatestCategoriesExpenses(expensesArray);
          // Adicionar novo registro com a combinação das categorias antigas e novas
          monthData.dailyRecords.push({ 
            day, 
            categorysExpenses: { ...latestCategories, ...newExpense } 
          });
        }
  
        await prismaClient.actionExpensesGrafic.update({
          where: { id: existingExpenses.id },
          data: { categorysExpenses: expensesArray },
        });
      } else {
        expensesArray = [{ year, months: [{ month, dailyRecords: [{ day, categorysExpenses: newExpense }] }] }];
  
        await prismaClient.actionExpensesGrafic.create({
          data: {
            actionId,
            ngoId: parseInt(actionId),
            categorysExpenses: expensesArray,
          },
        });
      }
  
      // Pegar a versão mais atual após as modificações
      const updatedActionExpenses = await prismaClient.actionExpensesGrafic.findFirst({
        where: { actionId },
      });
  
      if (!updatedActionExpenses) {
        throw new CustomError("Erro ao buscar despesas atualizadas", 500);
      }
      
      // Calcular o novo `spent` da ação (último dailyRecord)
      let latestSpent = 0;
      const currentExpensesArray = updatedActionExpenses.categorysExpenses as Array<any>;
              
      if (currentExpensesArray && currentExpensesArray.length > 0) {
        const latestYear = currentExpensesArray[currentExpensesArray.length - 1];
        if (latestYear?.months && latestYear.months.length > 0) {
          const latestMonth = latestYear.months[latestYear.months.length - 1];
          if (latestMonth?.dailyRecords && latestMonth.dailyRecords.length > 0) {
            const latestDay = latestMonth.dailyRecords[latestMonth.dailyRecords.length - 1];
            if (latestDay?.categorysExpenses) {
              latestSpent = Object.values(latestDay.categorysExpenses as Record<string, number>)
                .reduce((sum, amount) => sum + Number(amount), 0);
            }
          }
        }
      }
  
      const updatedAction = await prismaClient.action.update({
        where: { id: actionId },
        data: { spent: latestSpent },
        include: { ngo: true },
      });
  
      if (!updatedAction.ngo) {
        throw new CustomError("Ação sem ONG associada", 404);
      }
  
      const ngoId = updatedAction.ngo.id;
  
      // Atualizar dados da ONG - otimizado com uma única consulta
      const [allActions, ngoGraphic] = await Promise.all([
        prismaClient.action.findMany({ where: { ngoId } }),
        prismaClient.ngoGraphic.findUnique({ where: { ngoId } })
      ]);
  
      if (!ngoGraphic) {
        throw new CustomError("Gráfico da ONG não encontrado", 404);
      }
  
      // Criar um objeto para expensesByAction otimizado
      const allActionsExpenses = allActions.reduce<Record<string, number>>((acc, action) => {
        acc[action.name] = action.spent || 0;
        return acc;
      }, {});
  
      // Atualizar o gráfico da ONG
      let ngoExpensesArray = ngoGraphic.expensesByAction as Array<any>;
      let yearData = ngoExpensesArray.find((entry: any) => entry.year === year);
  
      if (!yearData) {
        yearData = { year, months: [] };
        ngoExpensesArray.push(yearData);
      }
  
      let monthData = yearData.months.find((m: any) => m.month === month);
  
      if (!monthData) {
        monthData = { month, dailyRecords: [] };
        yearData.months.push(monthData);
      }
  
      let dayData = monthData.dailyRecords.find((d: any) => d.day === day);
  
      if (dayData) {
        dayData.expensesByAction = allActionsExpenses;
      } else {
        monthData.dailyRecords.push({ day, expensesByAction: allActionsExpenses });
      }
  
      // Calcular o total de despesas
      const totalExpenses = allActions.reduce((sum, action) => sum + (action.spent || 0), 0);
  
      await prismaClient.ngoGraphic.update({
        where: { ngoId },
        data: {
          expensesByAction: ngoExpensesArray,
          totalExpenses,
        },
      });
  
      // Retornar o registro atualizado
      return updatedActionExpenses;
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 400);
      }
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }


  async findExpensesByActionId(actionId: string): Promise<any> {
    try {
      return prismaClient.actionExpensesGrafic.findMany({
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