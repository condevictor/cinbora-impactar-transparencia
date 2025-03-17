import { Action, ActionRepository } from "@modules/action";
import { CustomError } from "@shared/customError";
import { NgoExpensesGrafic } from "@routeParams/RouteParams"

class GetActionService {
  private actionRepository: ActionRepository;

  constructor(actionRepository: ActionRepository) {
    this.actionRepository = actionRepository;
  }

  async execute(): Promise<Action[]> {
    try {
      return this.actionRepository.findAll();
    } catch (error) {
      console.error("Erro ao obter ações:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter ações", 500);
    }
  }

  async executeById(id: string): Promise<Action | null> {
    try {
      const action = await this.actionRepository.findById(id);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
      return action;
    } catch (error) {
      console.error("Erro ao obter ação por ID:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter ação por ID", 500);
    }
  }

  async executeByNgoId(ngoId: string): Promise<Action[]> {
    try {
      return this.actionRepository.findByNgoId(ngoId);
    } catch (error) {
      console.error("Erro ao obter ações por ONG ID:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter ações por ONG ID", 500);
    }
  }

  async executeByNgoIdAndActionId(ngoId: string, actionId: string): Promise<Action | null> {
    try {
      const action = await this.actionRepository.findByNgoIdAndActionId(ngoId, actionId);
      if (!action) {
        throw new CustomError("Ação não encontrada", 404);
      }
      return action;
    } catch (error) {
      console.error("Erro ao obter ação por ONG ID e Ação ID:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter ação por ONG ID e Ação ID", 500);
    }
  }

  async getExpensesByActionId(actionId: string): Promise<NgoExpensesGrafic | null> {
    try {
      return this.actionRepository.findExpensesByActionId(actionId);
    } catch (error) {
      console.error("Erro ao obter despesas por ID da ação:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter despesas por ID da ação", 500);
    }
  }
}

export { GetActionService };