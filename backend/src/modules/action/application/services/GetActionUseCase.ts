import { Action, ActionRepository } from "@modules/action";

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

export { GetActionUseCase };
