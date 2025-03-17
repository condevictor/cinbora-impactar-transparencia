import { User, UserProps } from "@modules/user";
import { UserRepository } from "@modules/user";

class CreateUserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(data: UserProps): Promise<User> {
    const user = new User(data);
    return this.userRepository.create(user);
  }
}

export { CreateUserService };