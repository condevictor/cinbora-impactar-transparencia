import { OngRepository, CreateOngService, DeleteOngService, GetOngService, UpdateOngService, UpdateNgoGraficService } from "@modules/ong";

const ongRepository = new OngRepository();
const createOngService = new CreateOngService(ongRepository);
const deleteOngService = new DeleteOngService(ongRepository);
const getOngService = new GetOngService(ongRepository);
const updateOngService = new UpdateOngService(ongRepository);
const updateNgoGraficService = new UpdateNgoGraficService(ongRepository);

export { createOngService, deleteOngService, getOngService, updateOngService, updateNgoGraficService };