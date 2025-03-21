import request from 'supertest';
import Fastify from 'fastify';
import { OngController } from '../OngController';
import { createOngService, getOngService, updateOngService, deleteOngService, updateNgoGraficService } from '@config/dependencysInjection/ongDependencyInjection';
import { CustomError } from '@shared/customError';

jest.mock('@config/dependencysInjection/ongDependencyInjection');

const server = Fastify();
const ongController = new OngController(
  createOngService,
  deleteOngService,
  getOngService,
  updateOngService,
  updateNgoGraficService
);

server.get('/ongs/:id/grafic', ongController.getOneWithGrafic.bind(ongController));

describe('OngController - GetOneWithGrafic', () => {
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

  it('should return a single ONG with grafic data', async () => {
    const ong = {
      id: 1,
      name: 'ONG One',
      description: 'Description One',
      is_formalized: true,
      start_year: 2000,
      contact_phone: '123456789',
      instagram_link: 'https://instagram.com/ongone',
      x_link: 'https://x.com/ongone',
      facebook_link: 'https://facebook.com/ongone',
      pix_qr_code_link: 'https://pix.com/ongone',
      site: 'https://ongone.com',
      gallery_images_url: [],
      skills: {},
      causes: {},
      sustainable_development_goals: {}
    };

    const ngoGrafic = {
      totalExpenses: 1000,
      expensesByCategory: { "Education": 500, "Health": 500 }
    };

    (getOngService.executeById as jest.Mock).mockResolvedValue(ong);
    (getOngService.getGraficByNgoId as jest.Mock).mockResolvedValue(ngoGrafic);

    const response = await request(server.server)
      .get('/ongs/1/grafic');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ngo: ong, ngoGrafic });
  }, 10000); 

  it('should return an error if fetching the ONG with grafic data fails', async () => {
    (getOngService.executeById as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));

    const response = await request(server.server)
      .get('/ongs/1/grafic');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});