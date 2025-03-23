import request from 'supertest';
import Fastify from 'fastify';
import { OngController } from '../OngController';
import { createOngService, getOngService, updateOngService, deleteOngService, updateNgoGraficService } from '@config/dependencysInjection/ongDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/ongDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

const server = Fastify();
const ongController = new OngController(
  createOngService,
  deleteOngService,
  getOngService,
  updateOngService,
  updateNgoGraficService
);

server.delete('/ongs/:id', async (req, reply) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com'};
  
  try {
    // Capturar o resultado do controller
    await ongController.delete(req);
    
    // Enviar resposta de sucesso
    return reply.status(200).send({ message: 'ONG deletada com sucesso' });
  } catch (error) {
    console.error("Erro na deleção de ONG:", error);
    
    if (error instanceof CustomError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    
    return reply.status(500).send({ error: "Internal Server Error" });
  }
});

describe('OngController - Delete', () => {
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

  it('should delete an ONG', async () => {
    (deleteOngService.execute as jest.Mock).mockResolvedValue(undefined);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .delete('/ongs/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'ONG deletada com sucesso' });
  }, 10000);

  it('should return an error if deleting the ONG fails', async () => {
    (deleteOngService.execute as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .delete('/ongs/1');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});