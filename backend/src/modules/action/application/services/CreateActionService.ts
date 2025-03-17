import { Action, ActionProps, ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";

class CreateActionService {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(data: ActionProps): Promise<Action> {
    try {
      const action = new Action(data);
      return this.actionRepository.create(action);
    } catch (error) {
      console.error("Erro ao criar ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao criar ação", 500);
    }
  }
}

export { CreateActionService };