import { User } from "@modules/user";
import { UserRepository } from "@modules/user";

class GetUserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async executeByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}

export { GetUserService };