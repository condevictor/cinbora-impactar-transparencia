import request from 'supertest';
import Fastify from 'fastify';
import { OngController } from '../OngController';
import { createOngService } from '@config/dependencysInjection/ongDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/ongDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

const server = Fastify();
const ongController = new OngController();

server.post('/ongs', async (req, res) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
  await ongController.create(req, res);
});

describe('OngController - Create', () => {
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

  it('should create a new ONG', async () => {
    const newOng = {
      id: 1,
      name: 'New ONG',
      description: 'New Description',
      is_formalized: true,
      start_year: 2021,
      contact_phone: '123456789',
      instagram_link: 'https://instagram.com/newong',
      x_link: 'https://x.com/newong',
      facebook_link: 'https://facebook.com/newong',
      pix_qr_code_link: 'https://pix.com/newong',
      site: 'https://newong.com',
      gallery_images_url: [],
      skills: {},
      causes: {},
      sustainable_development_goals: {},
    };

    (createOngService.execute as jest.Mock).mockResolvedValue(newOng);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/ongs')
      .send(newOng);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(newOng);
  }, 10000);

  it('should return an error if creating the ONG fails', async () => {
    (createOngService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao criar ONG', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/ongs')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao criar ONG');
  }, 10000);
});