import { ActionRepository } from "@modules/action";

class UpdateActionExpensesGraficUseCase {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(actionId: string, newExpense: Record<string, number>): Promise<any> {
    return this.actionRepository.updateActionExpensesGrafic(actionId, newExpense);
  }
}

export { UpdateActionExpensesGraficUseCase };
