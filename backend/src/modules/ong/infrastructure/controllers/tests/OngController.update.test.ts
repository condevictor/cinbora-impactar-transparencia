// @ts-nocheck

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

server.put('/ongs', async (req, reply) => {
  // Mock request.user to include the ONG ID from the token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1, profileUrl: 'exampleurl.com' };
  
  try {
    // Capturar o resultado do controller
    const result = await ongController.update(req);
    
    // Enviar resposta para o cliente
    return reply.send(result);
  } catch (error) {
    console.error("Erro na rota:", error);
    
    if (error instanceof CustomError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    
    return reply.status(500).send({ error: "Internal Server Error" });
  }
});

describe('OngController - Update', () => {
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

  it('should update the ONG', async () => {
    const updatedData = {
      name: 'Updated ONG',
      description: 'Updated Description',
      is_formalized: true,
      start_year: 2000,
      contact_phone: '123456789',
      instagram_link: 'https://instagram.com/updatedong',
      x_link: 'https://x.com/updatedong',
      facebook_link: 'https://facebook.com/updatedong',
      pix_qr_code_link: 'https://pix.com/updatedong',
      site: 'https://updatedong.com',
      gallery_images_url: [],
      skills: {},
      causes: {},
      sustainable_development_goals: {}
    };

    (updateOngService.execute as jest.Mock).mockResolvedValue(updatedData);
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .put('/ongs')
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'ONG atualizada com sucesso', ngo: updatedData });
  }, 10000);

  it('should return an error if updating the ONG fails', async () => {
    (updateOngService.execute as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .put('/ongs')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});