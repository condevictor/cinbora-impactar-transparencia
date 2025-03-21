import { ActionRepository, CreateActionService, DeleteActionService, GetActionService, UpdateActionService, UpdateActionExpensesGraficService } from "@modules/action";
import { ActionController } from "@modules/action";
import { CreateFileAwsService } from "@modules/file"; // Adicionar esta importação

const actionRepository = new ActionRepository();
const createActionService = new CreateActionService(actionRepository);
const deleteActionService = new DeleteActionService(actionRepository);
const getActionService = new GetActionService(actionRepository);
const updateActionService = new UpdateActionService(actionRepository);
const updateActionExpensesGraficService = new UpdateActionExpensesGraficService(actionRepository);
const createFileAwsService = new CreateFileAwsService(); 

const actionController = new ActionController(
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService,
  createFileAwsService 
);

export { 
  createActionService, 
  deleteActionService, 
  getActionService, 
  updateActionService, 
  updateActionExpensesGraficService, 
  createFileAwsService, 
  actionController 
};