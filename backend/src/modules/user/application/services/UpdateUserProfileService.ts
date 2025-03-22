import { UserRepository } from "@modules/user/domain/repositories/UserRepository";
import { User } from "@modules/user";
import { CreateFileAwsService } from "@modules/file";
import { CustomError } from "@shared/customError";
import { DeleteFileService } from "@modules/file";

class UpdateUserProfileService {
  private userRepository: UserRepository;
  private createFileAwsService: CreateFileAwsService;
  private deleteFileService: DeleteFileService;

  constructor(
    userRepository: UserRepository,
    createFileAwsService: CreateFileAwsService,
    deleteFileService: DeleteFileService
  ) {
    this.userRepository = userRepository;
    this.createFileAwsService = createFileAwsService;
    this.deleteFileService = deleteFileService;
  }

  async execute(userId: string, file: any): Promise<User | null> {
    try {
      // Verificar se o usuário existe
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw new CustomError("Usuário não encontrado", 404);
      }

      // Obtenha o ngoId do usuário
      const ngoId = existingUser.ngoId;

      // Processar o arquivo para upload
      const buffer = await file.toBuffer();
      const filename = file.filename;

      // Usar o método updateProfilePhoto do repositório que já tem toda a lógica implementada
      const profileUrl = await this.userRepository.updateProfilePhoto(
        userId, 
        ngoId, 
        buffer, 
        filename
      );

      // Atualizar o usuário com a nova URL e retorná-lo
      return await this.userRepository.findById(userId);
    } catch (error) {
      console.error("Erro ao atualizar foto de perfil:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar foto de perfil", 500);
    }
  }
}

export { UpdateUserProfileService };
