import { UserRepository, CreateUserService, DeleteUserService, GetUserService, UserController } from "@modules/user";

const userRepository = new UserRepository();
const createUserService = new CreateUserService(userRepository);
const deleteUserService = new DeleteUserService(userRepository);
const getUserService = new GetUserService(userRepository);

const userController = new UserController(
    createUserService,
    deleteUserService,
    getUserService
);

export { createUserService, deleteUserService, getUserService, userController };