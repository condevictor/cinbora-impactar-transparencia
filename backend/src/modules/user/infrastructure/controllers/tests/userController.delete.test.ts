import request from 'supertest';
import Fastify from 'fastify';
import { UserController } from '../UserController';
import { deleteUserService } from '@config/dependencysInjection/userDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/userDependencyInjection');

const server = Fastify();
const userController = new UserController();

server.delete('/users/:id', userController.delete.bind(userController));

describe('UserController - Delete', () => {
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

  it('should delete a user', async () => {
    const userId = '1';

    (deleteUserService.execute as jest.Mock).mockResolvedValue({ message: 'Usuário deletado com sucesso' });

    const response = await request(server.server)
      .delete(`/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Usuário deletado com sucesso');
  }, 10000);

  it('should return an error if user deletion fails', async () => {
    const userId = '1';

    (deleteUserService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao deletar usuário', 500));

    const response = await request(server.server)
      .delete(`/users/${userId}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao deletar usuário');
  }, 10000);
});