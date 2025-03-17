import request from 'supertest';
import Fastify from 'fastify';
import { OngController } from '../OngController';
import { deleteOngService } from '@config/dependencysInjection/ongDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/ongDependencyInjection');

const server = Fastify();
const ongController = new OngController();

server.delete('/ongs/:id', ongController.delete.bind(ongController));

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

    const response = await request(server.server)
      .delete('/ongs/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'ONG deletada com sucesso' });
  }, 10000);

  it('should return an error if deleting the ONG fails', async () => {
    (deleteOngService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao deletar ONG', 500));

    const response = await request(server.server)
      .delete('/ongs/1');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao deletar ONG');
  }, 10000);
});