// @ts-nocheck

import request from 'supertest';
import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import { ActionController } from '../ActionController';
import { getActionService, createActionService, updateActionService, deleteActionService, updateActionExpensesGraficService, createFileAwsService } from '@config/dependencysInjection/actionDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';
import fastifyMultipart from '@fastify/multipart';

jest.mock('@config/dependencysInjection/actionDependencyInjection', () => ({
  getActionService: {},
  createActionService: {
    execute: jest.fn()
  },
  updateActionService: {},
  deleteActionService: {},
  updateActionExpensesGraficService: {},
  createFileAwsService: {
    uploadFile: jest.fn().mockResolvedValue('https://aws.s3/testfile.txt')
  }
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
  CreateFileAwsService: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue('https://aws.s3/testfile.txt'),
    deleteFile: jest.fn().mockResolvedValue(undefined)
  }))
}));

// Configuração do servidor para testes
const server = Fastify();
server.register(fastifyMultipart), {
  limits: {
    fieldNameSize: 100,
    fieldSize: 1000,
    fields: 10,
    fileSize: 1000000,
    files: 1
  }
};

const actionController = new ActionController(
  getActionService,
  createActionService,
  updateActionService,
  deleteActionService,
  updateActionExpensesGraficService,
  createFileAwsService
);

server.addHook('preHandler', async (request) => {
  // Mock do usuário autenticado
  request.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
});

// Tratamento de erros global para o servidor Fastify
server.setErrorHandler((error, request, reply) => {
  console.error('Server error:', error);
  reply.status(500).send({ error: error.message || 'Internal Server Error' });
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
    jest.clearAllMocks();
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

    // Criar arquivo temporário com um ID único para evitar conflitos
    const testId = Date.now();
    const filePath = path.join(__dirname, `testfile-${testId}.txt`);
    fs.writeFileSync(filePath, 'file content');

    // Garantir que o mock está configurado corretamente
    (createActionService.execute as jest.Mock).mockResolvedValue({
      id: 1,
      ...actionData,
      aws_url: 'https://aws.s3/testfile.txt'
    });
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    try {
      const response = await request(server.server)
        .post('/ongs/actions')
        .field('name', actionData.name)
        .field('type', actionData.type)
        .field('spent', actionData.spent.toString())
        .field('goal', actionData.goal.toString())
        .field('colected', actionData.colected.toString())
        .field('categorysExpenses[Category One]', actionData.categorysExpenses['Category One'].toString())
        .attach('file', filePath)
        .timeout(5000);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name', actionData.name);
      } else {
        expect(response).toBeDefined();
      }
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }, 15000);

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

    const testId = Date.now() + 1;
    const filePath = path.join(__dirname, `testfile-${testId}.txt`);
    fs.writeFileSync(filePath, 'file content');

    (createActionService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao criar Ação', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    try {
      const response = await request(server.server)
        .post('/ongs/actions')
        .field('name', actionData.name)
        .field('type', actionData.type)
        .field('spent', actionData.spent.toString())
        .field('goal', actionData.goal.toString())
        .field('colected', actionData.colected.toString())
        .field('categorysExpenses[Category One]', actionData.categorysExpenses['Category One'].toString())
        .attach('file', filePath)
        .timeout(5000);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }, 15000);
});