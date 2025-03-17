import { ActionRepository } from "@modules/action";

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

export { DeleteActionUseCase };
