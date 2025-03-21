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

// Código corrigido:
server.post('/ongs', async (req, reply) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
  
  try {
    const result = await ongController.create(req);
    return reply.status(201).send(result);  // Status 201 para criação e envia o resultado
  } catch (error) {
    console.error("Erro na criação de ONG:", error);
    
    if (error instanceof CustomError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    
    return reply.status(500).send({ error: "Internal Server Error" });
  }
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
    (createOngService.execute as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .post('/ongs')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});