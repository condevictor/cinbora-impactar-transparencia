import request from 'supertest';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';
import { FileController } from '../FileController';
import { uploadOngFileService, uploadActionFileService, deleteFileService as mockDeleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService } from '@config/dependencysInjection/fileDependencyInjection';

jest.mock('@config/dependencysInjection/fileDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

const server = Fastify();
const deleteFileService = mockDeleteFileService;
const fileController = new FileController(uploadOngFileService, uploadActionFileService, deleteFileService, getActionFilesByCategoryService, getOngFilesByCategoryService);

interface DeleteParams {
  id: string;
}

server.delete('/file/:id', async (req: FastifyRequest<{ Params: DeleteParams }>, res: FastifyReply) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
  await fileController.delete(req, res);
});

describe('FileController - deleteFile', () => {
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

  it('should delete a file', async () => {
    const fileId = '1';

    (deleteFileService.execute as jest.Mock).mockResolvedValue(undefined);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .delete(`/file/${fileId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Arquivo deletado com sucesso' });
  }, 10000);

  it('should return an error if file deletion fails', async () => {
    const fileId = '1';

    (deleteFileService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao deletar o arquivo', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .delete(`/file/${fileId}`)
      .send();

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao deletar o arquivo');
  }, 10000);
});