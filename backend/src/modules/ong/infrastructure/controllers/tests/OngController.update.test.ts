import request from 'supertest';
import Fastify from 'fastify';
import { OngController } from '../OngController';
import { updateOngService } from '@config/dependencysInjection/ongDependencyInjection';
import { logService } from '@config/dependencysInjection/logDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/ongDependencyInjection');
jest.mock('@config/dependencysInjection/logDependencyInjection');

const server = Fastify();
const ongController = new OngController();

server.put('/ongs', async (req, res) => {
  // Mock request.user to include the ONG ID from the token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
  await ongController.update(req, res);
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
    (updateOngService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao atualizar ONG', 500));
    (logService.logAction as jest.Mock).mockResolvedValue(undefined);

    const response = await request(server.server)
      .put('/ongs')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao atualizar ONG');
  }, 10000);
});