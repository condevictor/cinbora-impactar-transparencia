import request from 'supertest';
import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService } from '@config/dependencysInjection/actionDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/actionDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');
jest.mock('@modules/file', () => {
  return {
    CreateFileAwsService: jest.fn().mockImplementation(() => {
      return {
        uploadFile: jest.fn().mockResolvedValue('https://aws.s3/testfile.txt'),
        deleteFile: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

const server = Fastify();
server.register(require('@fastify/multipart'));

const actionController = new ActionController(
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService
);

server.addHook('preHandler', async (request, reply) => {
  // Mocka o request.user para incluir o ngoid do token
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
});

server.post('/ongs/actions', actionController.create.bind(actionController));

describe('ActionController - Create', () => {
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

  it('should create a new action', async () => {
    const actionData = {
      name: 'New Action',
      ngoId: 1,
      type: 'Type One',
      spent: 100,
      goal: 1000,
      colected: 500,
      categorysExpenses: { 'Category One': 100 }
    };

    const filePath = path.join(__dirname, 'testfile.txt');
    fs.writeFileSync(filePath, 'file content');

    (createActionService.execute as jest.Mock).mockResolvedValue({
      id: 1,
      ...actionData,
      aws_url: 'https://aws.s3/testfile.txt'
    });
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/ongs/actions')
      .field('name', actionData.name)
      .field('type', actionData.type)
      .field('spent', actionData.spent.toString())
      .field('goal', actionData.goal.toString())
      .field('colected', actionData.colected.toString())
      .field('categorysExpenses[Category One]', actionData.categorysExpenses['Category One'].toString())
      .attach('file', filePath);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      ...actionData,
      aws_url: 'https://aws.s3/testfile.txt'
    });

    fs.unlinkSync(filePath);
  }, 10000);

  it('should return an error if creating the action fails', async () => {
    const actionData = {
      name: 'New Action',
      ngoId: 1,
      type: 'Type One',
      spent: 100,
      goal: 1000,
      colected: 500,
      categorysExpenses: { 'Category One': 100 }
    };

    const filePath = path.join(__dirname, 'testfile.txt');
    fs.writeFileSync(filePath, 'file content');

    (createActionService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao criar Ação', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/ongs/actions')
      .field('name', actionData.name)
      .field('type', actionData.type)
      .field('spent', actionData.spent.toString())
      .field('goal', actionData.goal.toString())
      .field('colected', actionData.colected.toString())
      .field('categorysExpenses[Category One]', actionData.categorysExpenses['Category One'].toString())
      .attach('file', filePath);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao criar Ação');

    fs.unlinkSync(filePath);
  }, 10000);
});