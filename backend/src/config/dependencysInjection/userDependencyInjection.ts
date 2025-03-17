import { UserRepository, CreateUserService, DeleteUserService, GetUserService } from "@modules/user";

const userRepository = new UserRepository();
const createUserService = new CreateUserService(userRepository);
const deleteUserService = new DeleteUserService(userRepository);
const getUserService = new GetUserService(userRepository);

export { createUserService, deleteUserService, getUserService };