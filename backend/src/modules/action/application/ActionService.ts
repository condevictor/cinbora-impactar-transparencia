import { Action, ActionProps, ActionRepository } from "@modules/action";

class GetActionUseCase {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(): Promise<Action[]> {
    return this.actionRepository.findAll();
  }

  async executeById(id: string): Promise<Action | null> {
    return this.actionRepository.findById(id);
  }

  async executeByNgoId(ngoId: string): Promise<Action[]> {
    return this.actionRepository.findByNgoId(ngoId);
  }

  async executeByNgoIdAndActionId(ngoId: string, actionId: string): Promise<Action | null> {
    return this.actionRepository.findByNgoIdAndActionId(ngoId, actionId);
  }

  async getExpensesByActionId(actionId: string): Promise<any> {
    return this.actionRepository.findExpensesByActionId(actionId);
  }
}

class CreateActionUseCase {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(data: ActionProps): Promise<Action> {
    try {
      const action = new Action(data);
      return this.actionRepository.create(action);
    } catch (error) {
      console.error("Error in CreateActionUseCase:", error);
      throw error;
    }
  }
}

class UpdateActionUseCase {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(id: string, data: Partial<ActionProps>): Promise<Action> {
    try {
      const updatedAction = await this.actionRepository.update(id, data);
      return updatedAction;
    } catch (error) {
      console.error("Error in UpdateActionUseCase:", error);
      throw error;
    }
  }
}

interface DeleteActionProps {
  id: string;
}

class DeleteActionUseCase {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute({ id }: DeleteActionProps): Promise<void> {
    try {
      await this.actionRepository.delete(id);
    } catch (error) {
      console.error("Error in DeleteActionUseCase:", error);
      throw error;
    }
  }
}

class UpdateActionExpensesGraficUseCase {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(actionId: string, data: Partial<{ categorysExpenses: Record<string, number> }>): Promise<any> {
    return this.actionRepository.updateActionExpensesGrafic(actionId, data);
  }
}

export { GetActionUseCase, CreateActionUseCase, UpdateActionUseCase, DeleteActionUseCase, UpdateActionExpensesGraficUseCase };