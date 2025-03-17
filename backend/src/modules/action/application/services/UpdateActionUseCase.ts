import { Action, ActionProps, ActionRepository } from "@modules/action";

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

export { UpdateActionUseCase };
