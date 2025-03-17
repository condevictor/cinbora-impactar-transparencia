import { UserRepository } from "@modules/user";
import { CustomError } from "@shared/customError";

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
      throw new CustomError("Usuário não encontrado", 404);
    }

    await this.userRepository.delete(id);
  }
}

export { DeleteUserService };