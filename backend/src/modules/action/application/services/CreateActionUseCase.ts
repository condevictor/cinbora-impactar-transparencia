import { Action, ActionProps, ActionRepository } from "@modules/action";

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

export { CreateActionUseCase };
