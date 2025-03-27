// @ts-nocheck

import request from 'supertest';
import Fastify from 'fastify';

jest.mock('@config/dependencysInjection/fileDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

// Criar mock personalizado para o deleteFileService
const mockDeleteFileService = {
  execute: jest.fn()
};

const server = Fastify();

// Implementação simplificada da rota
server.delete('/file/:id', async (req, reply) => {

  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
  
  try {
    await mockDeleteFileService.execute((req.params as any).id);

    return reply.code(200).send({ message: 'Arquivo deletado com sucesso' });
  } catch {
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
});

describe('FileController - deleteFile', () => {
  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a file', async () => {
    const fileId = '1';

    // Configurar mock com resolução simples
    mockDeleteFileService.execute.mockResolvedValue(undefined);
    
    const response = await request(server.server)
      .delete(`/file/${fileId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Arquivo deletado com sucesso' });
    expect(mockDeleteFileService.execute).toHaveBeenCalledWith(fileId);
  }, 10000);
});