import request from 'supertest';
import Fastify from 'fastify';
import { UserController } from '../UserController';
import { createUserService, deleteUserService, getUserService, updateUserProfileService } from '@config/dependencysInjection/userDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/userDependencyInjection');

const server = Fastify();
const userController = new UserController(
  createUserService, 
  deleteUserService, 
  getUserService,
  updateUserProfileService
);

server.get('/users', userController.getAll.bind(userController));

describe('UserController - GetAll', () => {
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

  it('should return a list of users', async () => {
    const users = [
      { id: '1', name: 'User One', email: 'userone@example.com', ngoId: 1 },
      { id: '2', name: 'User Two', email: 'usertwo@example.com', ngoId: 2 },
    ];

    (getUserService.executeAll as jest.Mock).mockResolvedValue(users);

    const response = await request(server.server)
      .get('/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(users);
  }, 10000);

  it('should return an error if fetching users fails', async () => {
    (getUserService.executeAll as jest.Mock).mockRejectedValue(new CustomError('Erro ao obter usuários', 500));

    const response = await request(server.server)
      .get('/users');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao obter usuários');
  }, 10000);
});