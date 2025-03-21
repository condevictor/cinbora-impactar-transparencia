import { UserRepository } from "@modules/user/domain/repositories/UserRepository";
import { User } from "@modules/user";
import { CreateFileAwsService } from "@modules/file";
import { CustomError } from "@shared/customError";
import { DeleteFileService } from "@modules/file";
import { FileRepository } from "@modules/file";

class UpdateUserProfileService {
  private userRepository: UserRepository;
  private fileRepository: FileRepository;
  private createFileAwsService: CreateFileAwsService;
  private deleteFileService: DeleteFileService;

  constructor(
    userRepository: UserRepository,
    createFileAwsService: CreateFileAwsService,
    deleteFileService: DeleteFileService
  ) {
    this.userRepository = userRepository;
    this.createFileAwsService = createFileAwsService;
    this.fileRepository = new FileRepository();
    this.deleteFileService = deleteFileService;
  }

  async execute(userId: string, file: any): Promise<User> {
    try {
      // Verificar se o usuário existe
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        throw new CustomError("Usuário não encontrado", 404);
      }

      // Se o usuário já tem uma foto de perfil, exclua-a
      if (existingUser.profileUrl) {
        // Extrair o nome do arquivo da URL
        const key = existingUser.profileUrl.split('/').pop() || '';
        if (key) {
          try {
            await this.fileRepository.deleteFileFromS3(key);
          } catch (error) {
            console.error("Erro ao excluir foto de perfil anterior:", error);
          }
        }
      }

      // Processar o arquivo para upload
      const buffer = await file.toBuffer();
      const filename = `${Date.now()}-${file.filename}`;
      const folder = `users/${userId}/profile`;
      
      // Upload do arquivo para o S3
      const fullPath = `${folder}/${filename}`;
      const fileUrl = await this.createFileAwsService.uploadFile(buffer, fullPath);

      // Atualizar o perfil do usuário com a nova URL
      return await this.userRepository.updateProfile(userId, fileUrl);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar foto de perfil", 500);
    }
  }
}

export { UpdateUserProfileService };
