import { Action, ActionProps, ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";

class UpdateActionService {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(id: string, data: Partial<ActionProps>): Promise<Action> {
    try {
      const updatedAction = await this.actionRepository.update(id, data);
      return updatedAction;
    } catch (error) {
      console.error("Erro ao atualizar ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar ação", 500);
    }
  }
}

export { UpdateActionService };