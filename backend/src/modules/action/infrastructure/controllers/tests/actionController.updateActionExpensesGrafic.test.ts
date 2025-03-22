import request from 'supertest';
import Fastify from 'fastify';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService, createFileAwsService } from '@config/dependencysInjection/actionDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {
    executeById: jest.fn()
  },
  createActionService: {},
  updateActionService: {},
  deleteActionService: {},
  updateActionExpensesGraficService: {
    execute: jest.fn()
  },
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

server.addHook('preHandler', async (request, reply) => {
  // Mocka o request.user para incluir o ngoid do token
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
});

server.put('/ongs/actions/:id/expenses-grafic', actionController.updateActionExpensesGrafic.bind(actionController));

describe('ActionController - UpdateActionExpensesGrafic', () => {
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

  it('should update action expenses grafic successfully', async () => {
    const actionId = '1';
    const expensesData = {
      categorysExpenses: { 'Category One': 100, 'Category Two': 200 }
    };

    const updatedAction = {
      id: actionId,
      name: 'Test Action',
      ngoId: 1,
      type: 'Type One',
      spent: 300,
      goal: 1000,
      colected: 500,
      aws_url: 'https://aws.s3/testfile.txt',
      categorysExpenses: expensesData.categorysExpenses
    };

    (updateActionExpensesGraficService.execute as jest.Mock).mockResolvedValue(updatedAction);
    (getActionService.executeById as jest.Mock).mockResolvedValue(updatedAction);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .put(`/ongs/actions/${actionId}/expenses-grafic`)
      .send(expensesData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedAction);
    
    expect(updateActionExpensesGraficService.execute).toHaveBeenCalled();
    expect(logService.logAction).toHaveBeenCalled();
  }, 10000);

  it('should return an error if updating the expenses grafic fails', async () => {
    const actionId = '1';
    const expensesData = {
      categorysExpenses: { 'Category One': 100 }
    };

    const actionData = {
      id: actionId,
      name: 'Test Action',
      ngoId: 1
    };

    (getActionService.executeById as jest.Mock).mockResolvedValue(actionData);
    (updateActionExpensesGraficService.execute as jest.Mock).mockRejectedValue(
      new CustomError('Internal Server Error', 500)
    );
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .put(`/ongs/actions/${actionId}/expenses-grafic`)
      .send(expensesData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});