import request from 'supertest';
import Fastify from 'fastify';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService, createFileAwsService } from '@config/dependencysInjection/actionDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/actionDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

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

server.put('/ongs/actions/:id', actionController.update.bind(actionController));

describe('ActionController - Update', () => {
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

  it('should update an action successfully', async () => {
    const actionId = '1';
    const updateData = {
      name: 'Updated Action',
      type: 'Updated Type',
      spent: 200,
      goal: 2000,
      colected: 1000
    };

    const updatedAction = {
      id: actionId,
      ngoId: 1,
      ...updateData,
      aws_url: 'https://aws.s3/testfile.txt',
      categorysExpenses: { 'Category One': 100 }
    };

    (updateActionService.execute as jest.Mock).mockResolvedValue(updatedAction);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .put(`/ongs/actions/${actionId}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedAction);
    expect(updateActionService.execute).toHaveBeenCalledWith(actionId, updateData);
    expect(logService.logAction).toHaveBeenCalled();
  }, 10000);

  it('should return an error if updating the action fails', async () => {
    const actionId = '1';
    const updateData = {
      name: 'Updated Action'
    };

    (updateActionService.execute as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .put(`/ongs/actions/${actionId}`)
      .send(updateData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});