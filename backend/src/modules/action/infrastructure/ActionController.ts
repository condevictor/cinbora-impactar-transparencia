import { FastifyRequest, FastifyReply } from "fastify";
import { GetActionUseCase, CreateActionUseCase, UpdateActionUseCase, DeleteActionUseCase, ActionRepository, UpdateActionExpensesGraficUseCase, ActionProps } from "@modules/action";

class ActionController {
  private getActionUseCase: GetActionUseCase;    
  private createActionUseCase: CreateActionUseCase;
  private updateActionUseCase: UpdateActionUseCase;
  private deleteActionUseCase: DeleteActionUseCase;
  private updateActionExpensesGraficUseCase: UpdateActionExpensesGraficUseCase;

  constructor() {
    const actionRepository = new ActionRepository();
    this.getActionUseCase = new GetActionUseCase(actionRepository);
    this.createActionUseCase = new CreateActionUseCase(actionRepository);
    this.updateActionUseCase = new UpdateActionUseCase(actionRepository);
    this.deleteActionUseCase = new DeleteActionUseCase(actionRepository);
    this.updateActionExpensesGraficUseCase = new UpdateActionExpensesGraficUseCase(actionRepository);
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId } = request.params as { id: string };
    try {
      const actions = await this.getActionUseCase.executeByNgoId(ngoId);
      reply.send(actions);
    } catch (error) {
      console.error("Erro ao obter Ações:", error);
      reply.status(500).send({ error: "Erro ao obter Ações" });
    }
  }

  async getOne(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId, actionId } = request.params as { id: string, actionId: string };
    try {
      const action = await this.getActionUseCase.executeByNgoIdAndActionId(ngoId, actionId);
      if (!action) {
        reply.status(404).send({ error: "Ação não encontrada" });
        return;
      }
      reply.send(action);
    } catch (error) {
      console.error("Erro ao obter Ação:", error);
      reply.status(500).send({ error: "Erro ao obter Ação" });
    }
  }

  async getOneWithExpenses(request: FastifyRequest, reply: FastifyReply) {
    const { id: ngoId, actionId } = request.params as { id: string, actionId: string };
    try {
        const action = await this.getActionUseCase.executeByNgoIdAndActionId(ngoId, actionId);
        if (!action) {
            reply.status(404).send({ error: "Ação não encontrada" });
            return;
        }
        const ngoExpensesGrafic = await this.getActionUseCase.getExpensesByActionId(actionId);
        reply.send({ action, ngoExpensesGrafic });
    } catch (error) {
        console.error("Erro ao obter Ação:", error);
        reply.status(500).send({ error: "Erro ao obter Ação" });
    }
  }

  async updateActionExpensesGrafic(request: FastifyRequest, reply: FastifyReply) {
    const { actionId } = request.params as { actionId: string };
    const { categorysExpenses } = request.body as {
      categorysExpenses?: Record<string, number>;
    };

    try {
      const updatedGrafic = await this.updateActionExpensesGraficUseCase.execute(actionId, { categorysExpenses });
      reply.send(updatedGrafic);
    } catch (error) {
      console.error("Erro ao atualizar gráfico de despesas da ação:", error);
      reply.status(500).send({ error: "Erro ao atualizar gráfico de despesas da ação" });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { name, type, spent, goal, colected } = request.body as ActionProps;
  
    if (!request.user) {
      reply.status(401).send({ error: "Usuário não autenticado" });
      return;
    }
  
    try {
      const action = await this.createActionUseCase.execute({
        name,
        type,
        ngoId: request.user.ngoId, // Pegando o ngoId do usuário autenticado
        spent,
        goal,
        colected,
      });
  
      reply.send(action);
    } catch (error) {
      console.error("Error creating action:", error);
      reply.status(500).send({ error: "Erro ao criar ação" });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = request.body as Partial<ActionProps>;

    try {
      const updatedAction = await this.updateActionUseCase.execute(id, data);
      reply.send(updatedAction);
    } catch (error) {
      console.error("Error updating action:", error);
      reply.status(500).send({ error: "Erro ao atualizar ação" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    try {
      await this.deleteActionUseCase.execute({ id });
      reply.send({ message: "Ação deletada com sucesso" });
    } catch (error) {
      console.error("Error deleting action:", error);
      reply.status(500).send({ error: "Erro ao deletar ação" });
    }
  }
}

export { ActionController };