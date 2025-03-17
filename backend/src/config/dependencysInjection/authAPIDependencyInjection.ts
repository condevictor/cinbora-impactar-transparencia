import { AuthController } from "@modules/authAPI";
import { GetExternalDataService } from "@modules/authAPI";

const getExternalDataService = new GetExternalDataService();
const authController = new AuthController();

export { getExternalDataService, authController };