import { User } from "@modules/user";
import { UserRepository } from "@modules/user";

class GetUserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async executeByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    return user;
  }

  async executeById({ id }: { id: string }): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async executeAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}

export { GetUserService };