import request from 'supertest';
import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';
import { FileController } from '../FileController';
import { uploadOngFileService as mockUploadOngFileService, uploadActionFileService, deleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService } from '@config/dependencysInjection/fileDependencyInjection';
import { getActionService } from '@config/dependencysInjection/actionDependencyInjection';
import fastifyMultipart from '@fastify/multipart';

jest.mock('@config/dependencysInjection/fileDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

const server = Fastify();
const uploadOngFileService = mockUploadOngFileService;
const fileController = new FileController(uploadOngFileService, uploadActionFileService, deleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService, getActionService);

server.register(fastifyMultipart);

server.post('/upload', async (req, res) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
  try {
    const result = await fileController.uploadOngFile(req, res);
    return res.send(result);
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    if (error instanceof CustomError) {
      return res.status(error.statusCode).send({ error: error.message });
    }
    return res.status(500).send({ error: 'Erro interno ao fazer upload' });
  }
});

describe('FileController - uploadOngFile', () => {
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

  it('should upload a file', async () => {
    const filePath = path.join(__dirname, 'testFile.txt');
    fs.writeFileSync(filePath, 'This is a test file');

    const fileEntity = {
      id: '1',
      filename: 'testFile.txt',
      category: 'test-category',
      mimetype: 'text/plain',
      size: 18,
      ngoId: 1
    };

    (uploadOngFileService.execute as jest.Mock).mockResolvedValue(fileEntity);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/upload')
      .field('category', 'test-category')
      .attach('file', filePath);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fileEntity);

    fs.unlinkSync(filePath);
  }, 10000);

  it('should handle upload errors correctly - unit test', async () => {
    // Mock da requisição apenas com o necessário
    const mockReq = {
      user: { id: '1', ngoId: 1 },
      // Simulação mínima para o controller
      multipart: () => ({
        file: jest.fn().mockRejectedValue(new Error('Falha ao processar arquivo'))
      })
    } as any;
    
    const mockReply = {
      status: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
      send: jest.fn()
    } as any;
    
    // Mock do serviço para lançar erro
    jest.spyOn(uploadOngFileService, 'execute').mockRejectedValue(
      new CustomError('Erro ao fazer upload do arquivo', 500)
    );

    await expect(
      fileController.uploadOngFile(mockReq, mockReply)
    ).rejects.toThrow();
    
    const statusMethodCalled = mockReply.status.mock.calls.length > 0 || mockReply.code.mock.calls.length > 0;

    expect(statusMethodCalled).toBeTruthy();
    
    if (mockReply.status.mock.calls.length > 0) {
      expect(mockReply.status).toHaveBeenCalledWith(500);
    }
    
    if (mockReply.code.mock.calls.length > 0) {
      expect(mockReply.code).toHaveBeenCalledWith(500);
    }
    
    // Verificar se send foi chamado com algum erro
    if (mockReply.send.mock.calls.length > 0) {
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    }
  });
});