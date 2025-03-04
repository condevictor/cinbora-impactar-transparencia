import { UserRepository } from "../domain/UserRepository";
import { User } from "../domain/UserEntity";

interface CreateUserProps {
  name: string;
  email: string;
  ngoId: number;
}

class CreateUserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute({ name, email, ngoId }: CreateUserProps): Promise<User> {
    const user = new User({ name, email, ngoId });
    return this.userRepository.create(user);
  }
}

interface DeleteUserProps {
  id: string;
}

class DeleteUserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute({ id }: DeleteUserProps): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    await this.userRepository.delete(id);
  }
}

class GetUserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async executeByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}

export { CreateUserUseCase, DeleteUserUseCase, GetUserUseCase };