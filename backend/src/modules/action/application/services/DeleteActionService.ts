import { ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";
import { DeleteParams } from "@routeParams/RouteParams";

class DeleteActionService {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute({ id }: DeleteParams): Promise<void> {
    try {
      await this.actionRepository.delete(id);
    } catch (error) {
      console.error("Erro ao deletar ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao deletar ação", 500);
    }
  }
}

export { DeleteActionService };