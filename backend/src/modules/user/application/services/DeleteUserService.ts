import { UserRepository } from "@modules/user";

interface DeleteUserProps {
  id: string;
}

class DeleteUserService {
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

export { DeleteUserService };