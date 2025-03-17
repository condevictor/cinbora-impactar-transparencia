import { ActionRepository, CreateActionUseCase, DeleteActionUseCase, GetActionUseCase, UpdateActionUseCase, UpdateActionExpensesGraficUseCase } from "@modules/action";

const actionRepository = new ActionRepository();
const createActionUseCase = new CreateActionUseCase(actionRepository);
const deleteActionUseCase = new DeleteActionUseCase(actionRepository);
const getActionUseCase = new GetActionUseCase(actionRepository);
const updateActionUseCase = new UpdateActionUseCase(actionRepository);
const updateActionExpensesGraficUseCase = new UpdateActionExpensesGraficUseCase(actionRepository);

export { createActionUseCase, deleteActionUseCase, getActionUseCase, updateActionUseCase, updateActionExpensesGraficUseCase };