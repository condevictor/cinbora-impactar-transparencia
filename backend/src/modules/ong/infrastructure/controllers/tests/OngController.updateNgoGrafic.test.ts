import request from 'supertest';
import Fastify from 'fastify';
import { OngController } from '../OngController';
import { updateNgoGraficService } from '@config/dependencysInjection/ongDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/ongDependencyInjection');

const server = Fastify();
const ongController = new OngController();

server.put('/ongs/grafic', async (req, res) => {
  // Mocka o request.user para incluir o ngoid do token
  req.user = { id: '1', name: 'Test User', email: 'test@example.com', ngoId: 1 };
  await ongController.updateNgoGrafic(req, res);
});

describe('OngController - UpdateNgoGrafic', () => {
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

  it('should update the NGO grafic data', async () => {
    const updatedData = {
      id: 1,
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

    (updateNgoGraficService.execute as jest.Mock).mockResolvedValue(updatedData);

    const response = await request(server.server)
      .put('/ongs/grafic')
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedData);
  }, 10000);

  it('should return an error if updating the NGO grafic data fails', async () => {
    (updateNgoGraficService.execute as jest.Mock).mockRejectedValue(new CustomError('Erro ao atualizar dados gráficos da ONG', 500));

    const response = await request(server.server)
      .put('/ongs/grafic')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Erro ao atualizar dados gráficos da ONG');
  }, 10000);
});