import request from 'supertest';
import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';
import { FileController } from '../FileController';
import { uploadOngFileService as mockUploadOngFileService, uploadActionFileService, deleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService } from '@config/dependencysInjection/fileDependencyInjection';

jest.mock('@config/dependencysInjection/fileDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

const server = Fastify();
const uploadOngFileService = mockUploadOngFileService;
const fileController = new FileController(uploadOngFileService, uploadActionFileService, deleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService);

server.register(require('@fastify/multipart'));

server.post('/upload', async (req, res) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
  await fileController.uploadOngFile(req, res);
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

    fs.unlinkSync(filePath); // Clean up the test file
  }, 10000);

  it('should return an error if file upload fails', async () => {
    const filePath = path.join(__dirname, 'testFile.txt');
    fs.writeFileSync(filePath, 'This is a test file');

    (uploadOngFileService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao fazer upload do arquivo', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/upload')
      .field('category', 'test-category')
      .attach('file', filePath);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao fazer upload do arquivo');

    fs.unlinkSync(filePath); // Clean up the test file
  }, 10000);
});