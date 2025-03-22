import request from 'supertest';
import Fastify from 'fastify';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService, createFileAwsService} from '@config/dependencysInjection/actionDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/actionDependencyInjection');

const server = Fastify();
const actionController = new ActionController(
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService,
  createFileAwsService
);

server.get('/ongs/actions/:actionId', actionController.getOne.bind(actionController));

describe('ActionController - GetOne', () => {
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

  it('should return a single action', async () => {
    const action = { id: '1', name: 'Action One', ngoId: '1', type: 'Type One', spent: 100, goal: 1000, colected: 500 };

    (getActionService.executeById as jest.Mock).mockResolvedValue(action);

    const response = await request(server.server)
      .get('/ongs/actions/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(action);
  }, 10000);

  it('should return an error if fetching the action fails', async () => {
    (getActionService.executeById as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));

    const response = await request(server.server)
      .get('/ongs/actions/1');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});