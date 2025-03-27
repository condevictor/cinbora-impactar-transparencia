// @ts-nocheck

import request from 'supertest';
import Fastify from 'fastify';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService, createFileAwsService } from '@config/dependencysInjection/actionDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

// Improve the mock implementation
jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {
    executeById: jest.fn(),
    execute: jest.fn()
  },
  createActionService: {},
  updateActionService: {
    execute: jest.fn(),
  },
  deleteActionService: {},
  updateActionExpensesGraficService: {},
  createFileAwsService: {},
}));

jest.mock('@config/dependencysInjection/logDependencyInjection', () => ({
  logService: {
    logAction: jest.fn(),
  },
}));

// Add this to mock the file module
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
    
    (getActionService.executeById as jest.Mock).mockResolvedValue({
      id: actionId,
      ngoId: 1,
      name: 'Original Action',
      type: 'Original Type',
      spent: 100,
      goal: 1000,
      colected: 500
    });

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

    (getActionService.executeById as jest.Mock).mockResolvedValue({
      id: actionId,
      ngoId: 1,
      name: 'Original Action'
    });

    (updateActionService.execute as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .put(`/ongs/actions/${actionId}`)
      .send(updateData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});