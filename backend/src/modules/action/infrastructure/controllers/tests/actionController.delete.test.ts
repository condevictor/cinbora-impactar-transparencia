import request from 'supertest';
import Fastify from 'fastify';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService, createFileAwsService} from '@config/dependencysInjection/actionDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {
    executeById: jest.fn()
  },
  createActionService: {},
  updateActionService: {},
  deleteActionService: {
    execute: jest.fn()
  },
  updateActionExpensesGraficService: {},
  createFileAwsService: {},
}));

jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    logAction: jest.fn()
  }
}));

jest.mock('@modules/file', () => ({
  FileRepository: jest.fn().mockImplementation(() => ({})),
  UploadOngFileService: jest.fn().mockImplementation(() => ({})),
  UploadActionFileService: jest.fn().mockImplementation(() => ({})),
  DeleteFileService: jest.fn().mockImplementation(() => ({})),
  GetActionFilesByCategoryService: jest.fn().mockImplementation(() => ({})),
  GetOngFilesByCategoryService: jest.fn().mockImplementation(() => ({})),
  FileController: jest.fn().mockImplementation(() => ({})),
}));

const server = Fastify();

const actionController = new ActionController(
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService,
  createFileAwsService
);

server.addHook('preHandler', async (request) => {
  // Mocka o request.user para incluir o ngoid do token
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
});

server.delete('/ongs/actions/:id', actionController.delete.bind(actionController));

describe('ActionController - Delete', () => {
  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should delete an action successfully', async () => {
    const actionId = '1';
    const deletedAction = {
      id: actionId,
      name: 'Action to Delete',
      ngoId: 1,
      type: 'Type One',
      spent: 100,
      goal: 1000,
      colected: 500,
      aws_url: 'https://aws.s3/testfile.txt',
      categorysExpenses: { 'Category One': 100 }
    };

    (deleteActionService.execute as jest.Mock).mockResolvedValue(deletedAction);
    (getActionService.executeById as jest.Mock).mockResolvedValue(deletedAction);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .delete(`/ongs/actions/${actionId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Ação deletada com sucesso"
    });
    // Ajustado para verificar que foi chamado com um objeto contendo o ID
    expect(deleteActionService.execute).toHaveBeenCalledWith({id: actionId});
    expect(logService.logAction).toHaveBeenCalled();
  }, 10000);

  it('should return an error if deleting the action fails', async () => {
    const actionId = '1';
    const actionData = {
      id: actionId,
      name: 'Action to Delete',
      ngoId: 1
    };

    (getActionService.executeById as jest.Mock).mockResolvedValue(actionData);
    (deleteActionService.execute as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .delete(`/ongs/actions/${actionId}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});