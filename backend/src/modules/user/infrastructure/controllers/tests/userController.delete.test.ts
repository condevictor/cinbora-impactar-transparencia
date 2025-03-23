import request from 'supertest';
import Fastify from 'fastify';
import { UserController } from '../UserController';
import { createUserService, deleteUserService, getUserService, updateUserProfileService } from '@config/dependencysInjection/userDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/userDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

const server = Fastify();
const userController = new UserController(
  createUserService, 
  deleteUserService, 
  getUserService,
  updateUserProfileService
);

server.delete('/users/:id', async (req, res) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
  await userController.delete(req, res);
});

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
    const mockUser = { 
      id: userId, 
      name: 'Test User',
      email: 'test@example.com',
      ngoId: 1
    };

    (getUserService.executeById as jest.Mock).mockResolvedValue(mockUser);

    (deleteUserService.execute as jest.Mock).mockResolvedValue({ message: 'Usuário deletado com sucesso' });
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .delete(`/users/${userId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Usuário deletado com sucesso');
  }, 10000);

  it('should return an error if user deletion fails', async () => {
    const userId = '1';
    const mockUser = { 
      id: userId, 
      name: 'Test User',
      email: 'test@example.com',
      ngoId: 1
    };
    
    (getUserService.executeById as jest.Mock).mockResolvedValue(mockUser);

    (deleteUserService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao deletar usuário', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .delete(`/users/${userId}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao deletar usuário');
  }, 10000);
});