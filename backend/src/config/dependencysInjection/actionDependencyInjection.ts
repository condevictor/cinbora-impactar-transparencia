import { ActionRepository } from "@modules/action/domain/repositories/ActionRepository";
import { GetActionService, CreateActionService, UpdateActionService, DeleteActionService, UpdateActionExpensesGraficService } from "@modules/action";
import { ActionController } from "@modules/action/infrastructure/controllers/ActionController";
import { CreateFileAwsService } from "@modules/file/application/services/CreateFileAwsService";
import { FileRepository } from "@modules/file/domain/repositories/FileRepository";
import s3StorageInstance from "@shared/s3Cliente";

// Instanciar o repositório de arquivos
const fileRepository = new FileRepository();

// Instanciar o repositório de ações
const actionRepository = new ActionRepository();

// Criar os serviços necessários
const getActionService = new GetActionService(actionRepository);
// Agora passando o s3Storage como segundo parâmetro
const createActionService = new CreateActionService(actionRepository, s3StorageInstance);
const updateActionService = new UpdateActionService(actionRepository);
const deleteActionService = new DeleteActionService(actionRepository);
const updateActionExpensesGraficService = new UpdateActionExpensesGraficService(actionRepository);

// Instanciar o serviço de arquivo AWS com o repositório de arquivos
const createFileAwsService = new CreateFileAwsService(fileRepository);

// Instanciar o controlador de ações com todas as suas dependências
const actionController = new ActionController(
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService,
  createFileAwsService
);

export { 
  actionController,
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService,
  createFileAwsService
};