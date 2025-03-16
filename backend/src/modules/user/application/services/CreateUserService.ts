import { User, UserProps } from "@modules/user";
import { UserRepository } from "@modules/user";
import { CustomError } from "@shared/customError";

class CreateUserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(data: UserProps): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new CustomError("Usuário com este email já existe", 400);
    }

    const user = new User(data);
    return this.userRepository.create(user);
  }
}

export { CreateUserService };