// @ts-nocheck

import request from 'supertest';
import Fastify from 'fastify';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService, createFileAwsService } from '@config/dependencysInjection/actionDependencyInjection';
import { CustomError } from '@shared/customError';

// Mock all dependencies
jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {
    executeByNgoId: jest.fn(),
  },
  createActionService: {},
  updateActionService: {},
  deleteActionService: {},
  updateActionExpensesGraficService: {},
  createFileAwsService: {},
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

server.get('/ongs/:id/actions', actionController.getAll.bind(actionController));

describe('ActionController - GetAll', () => {
  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a list of actions', async () => {
    const actions = [
      { id: '1', name: 'Action One', ngoId: '1', type: 'Type One', spent: 100, goal: 1000, colected: 500 },
      { id: '2', name: 'Action Two', ngoId: '1', type: 'Type Two', spent: 200, goal: 2000, colected: 1500 },
    ];

    (getActionService.executeByNgoId as jest.Mock).mockResolvedValue(actions);

    const response = await request(server.server)
      .get('/ongs/1/actions');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(actions);
    expect(getActionService.executeByNgoId).toHaveBeenCalledWith('1');
  }, 10000);

  it('should return an error if fetching actions fails', async () => {
    (getActionService.executeByNgoId as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));

    const response = await request(server.server)
      .get('/ongs/1/actions');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});