import { OngRepository, CreateOngService, DeleteOngService, GetOngService, UpdateOngService, UpdateNgoGraficService, OngController } from "@modules/ong";
import { userRepository } from "./userDependencyInjection";

const ongRepository = new OngRepository(userRepository);
const createOngService = new CreateOngService(ongRepository);
const deleteOngService = new DeleteOngService(ongRepository);
const getOngService = new GetOngService(ongRepository);
const updateOngService = new UpdateOngService(ongRepository);
const updateNgoGraficService = new UpdateNgoGraficService(ongRepository);

const ongController = new OngController(
    createOngService,
    deleteOngService,
    getOngService,
    updateOngService,
    updateNgoGraficService
);

export { ongRepository, createOngService, deleteOngService, getOngService, updateOngService, updateNgoGraficService, ongController };