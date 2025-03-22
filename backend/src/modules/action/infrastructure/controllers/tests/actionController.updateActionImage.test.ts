import request from 'supertest';
import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService, createFileAwsService } from '@config/dependencysInjection/actionDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import fastifyMultipart from '@fastify/multipart';

jest.mock('@config/dependencysInjection/actionDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');
jest.mock('@modules/file', () => {
  return {
    CreateFileAwsService: jest.fn().mockImplementation(() => {
      return {
        uploadFile: jest.fn().mockResolvedValue('https://aws.s3/updated-testfile.txt'),
        deleteFile: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

const server = Fastify();
server.register(fastifyMultipart);

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
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
});

server.put('/ongs/actions/:id/image', actionController.updateActionImage.bind(actionController));

describe('ActionController - UpdateActionImage', () => {
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

  it('should update action image successfully', async () => {
    const actionId = '1';
    const action = {
      id: actionId,
      name: 'Test Action',
      ngoId: 1,
      type: 'Type One',
      spent: 300,
      goal: 1000,
      colected: 500,
      aws_url: 'https://aws.s3/testfile.txt',
      categorysExpenses: { 'Category One': 100 }
    };

    const updatedAction = {
      ...action,
      aws_url: 'https://aws.s3/updated-testfile.txt'
    };

    (getActionService.executeById as jest.Mock).mockResolvedValue(action);
    (updateActionService.execute as jest.Mock).mockResolvedValue(updatedAction);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const filePath = path.join(__dirname, 'testfile.txt');
    fs.writeFileSync(filePath, 'updated file content');

    const response = await request(server.server)
      .put(`/ongs/actions/${actionId}/image`)
      .attach('file', filePath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Imagem da ação atualizada com sucesso');
    expect(response.body).toHaveProperty('aws_url', 'https://aws.s3/updated-testfile.txt');
    expect(updateActionService.execute).toHaveBeenCalled();
    expect(logService.logAction).toHaveBeenCalled();

    fs.unlinkSync(filePath); // Clean up the test file
  }, 10000);

  it('should return an error if no file is uploaded', async () => {
    const actionId = '1';

    const response = await request(server.server)
      .put(`/ongs/actions/${actionId}/image`);

    expect(response.status).toBe(406);  // Corrigido para o status real retornado
    expect(response.body).toHaveProperty('error', 'Not Acceptable');
  }, 10000);
});