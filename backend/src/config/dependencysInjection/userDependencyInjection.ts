import { UserRepository } from "@modules/user/domain/repositories/UserRepository";
import { CreateUserService } from "@modules/user/application/services/CreateUserService";
import { DeleteUserService } from "@modules/user/application/services/DeleteUserService";
import { GetUserService } from "@modules/user/application/services/GetUserService";
import { UpdateUserProfileService } from "@modules/user/application/services/UpdateUserProfileService";
import { UserController } from "@modules/user/infrastructure/controllers/UserController";
import { CreateFileAwsService, DeleteFileService, FileRepository } from "@modules/file";
import s3StorageInstance from "@shared/s3Cliente";

// Instanciar o FileRepository primeiro
const fileRepository = new FileRepository();

// Instanciar os serviços com os parâmetros corretos
const deleteFileService = new DeleteFileService(fileRepository);
const createFileAwsService = new CreateFileAwsService();

// O repositório de usuário agora requer o serviço de exclusão de arquivos
const userRepository = new UserRepository(deleteFileService, s3StorageInstance);

// Serviços
const createUserService = new CreateUserService(userRepository);
const deleteUserService = new DeleteUserService(userRepository);
const getUserService = new GetUserService(userRepository);
const updateUserProfileService = new UpdateUserProfileService(
  userRepository, 
  createFileAwsService, 
  deleteFileService
);

// Controller
const userController = new UserController(
  createUserService, 
  deleteUserService, 
  getUserService,
  updateUserProfileService
);

export { 
  userRepository, 
  createUserService, 
  deleteUserService, 
  getUserService, 
  updateUserProfileService, 
  userController 
};