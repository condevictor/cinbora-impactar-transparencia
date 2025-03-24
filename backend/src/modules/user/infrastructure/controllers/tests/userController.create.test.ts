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

server.post('/users', async (req, res) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com'};
  await userController.create(req, res);
});

describe('UserController - Create', () => {
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

  it('should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      ngoId: 1,
      profileUrl: 'exampleurl.com'
    };

    (createUserService.execute as jest.Mock).mockResolvedValue({
      id: '1',
      ...userData,
    });
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/users')
      .send(userData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
    expect(response.body.user).toMatchObject(userData);
  }, 10000);

  it('should return an error if user creation fails', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      ngoId: 1,
      profileUrl: 'exampleurl.com'
    };

    (createUserService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao criar usuário', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/users')
      .send(userData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao criar usuário');
  }, 10000);
});