import { Action, ActionProps, ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";

// Extended interface to include categorysExpenses
interface ActionCreateProps extends ActionProps {
  categorysExpenses?: Record<string, number>;
}

class CreateActionService {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(data: ActionCreateProps): Promise<Action> {
    try {
      // Create a base Action without categorysExpenses
      const action = new Action({
        name: data.name,
        type: data.type,
        ngoId: data.ngoId,
        spent: data.spent,
        goal: data.goal,
        colected: data.colected,
        aws_url: data.aws_url,
      });
      
      // Pass the action along with categorysExpenses to repository
      return this.actionRepository.create({
        ...action,
        categorysExpenses: data.categorysExpenses || {}
      });
    } catch (error) {
      console.error("Erro ao criar ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao criar ação", 500);
    }
  }
}

export { CreateActionService, ActionCreateProps };