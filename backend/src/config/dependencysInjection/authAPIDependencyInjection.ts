import { AuthController } from "@modules/authAPI";
import { GetExternalDataService } from "@modules/authAPI";
import { CreateUserService, GetUserService, UserRepository } from "@modules/user";
import { CreateOngService, GetOngService, OngRepository } from "@modules/ong";
import { GetActionService, ActionRepository } from "@modules/action";
import { JWTService } from "@shared/jwtService";
import { LoginAPIController } from "@modules/authAPI";

const getExternalDataService = new GetExternalDataService();
const userRepository = new UserRepository();
const ongRepository = new OngRepository();
const actionRepository = new ActionRepository();
const createUserService = new CreateUserService(userRepository);
const getUserService = new GetUserService(userRepository);
const createOngService = new CreateOngService(ongRepository);
const getOngService = new GetOngService(ongRepository);
const getActionService = new GetActionService(actionRepository);
const jwtService = new JWTService();

const authController = new AuthController(
  getExternalDataService,
  createUserService,
  getUserService,
  createOngService,
  getOngService,
  getActionService,
  jwtService
);

const loginAPIController = new LoginAPIController(authController);

export { getExternalDataService, authController, loginAPIController };