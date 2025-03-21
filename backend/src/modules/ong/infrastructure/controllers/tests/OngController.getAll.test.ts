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

server.get('/ongs', ongController.getAll.bind(ongController));

describe('OngController - GetAll', () => {
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

  it('should return a list of ONGs', async () => {
    const ongs = [
      { id: 1, name: 'ONG One', description: 'Description One', is_formalized: true, start_year: 2000, contact_phone: '123456789', instagram_link: 'https://instagram.com/ongone', x_link: 'https://x.com/ongone', facebook_link: 'https://facebook.com/ongone', pix_qr_code_link: 'https://pix.com/ongone', site: 'https://ongone.com', gallery_images_url: [], skills: {}, causes: {}, sustainable_development_goals: {} },
      { id: 2, name: 'ONG Two', description: 'Description Two', is_formalized: false, start_year: 2010, contact_phone: '987654321', instagram_link: 'https://instagram.com/ongtwo', x_link: 'https://x.com/ongtwo', facebook_link: 'https://facebook.com/ongtwo', pix_qr_code_link: 'https://pix.com/ongtwo', site: 'https://ongtwo.com', gallery_images_url: [], skills: {}, causes: {}, sustainable_development_goals: {} },
    ];

    (getOngService.execute as jest.Mock).mockResolvedValue(ongs);

    const response = await request(server.server)
      .get('/ongs');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(ongs);
  }, 10000);

  it('should return an error if fetching ONGs fails', async () => {
    (getOngService.execute as jest.Mock).mockRejectedValue(new CustomError('Internal Server Error', 500));

    const response = await request(server.server)
      .get('/ongs');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error', 'Internal Server Error');
  }, 10000);
});