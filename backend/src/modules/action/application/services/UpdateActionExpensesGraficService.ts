import { ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";

class UpdateActionExpensesGraficService {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(actionId: string, newExpense: Record<string, number>): Promise<Record<string, number>[]> {
    try {
      const updatedExpenses = await this.actionRepository.updateActionExpensesGrafic(actionId, newExpense);
      if (!Array.isArray(updatedExpenses)) {
        throw new CustomError("Invalid response format", 500);
      }
      return updatedExpenses;
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar gráfico de despesas da ação", 500);
    }
  }
}

export { UpdateActionExpensesGraficService };