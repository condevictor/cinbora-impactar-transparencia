import { FastifyRequest, FastifyReply } from "fastify";
import { GetExternalDataService } from "./externalAPIService";
import { CustomError } from "@middlewares/customError";
import { CreateUserUseCase, GetUserUseCase } from "../../application/UserService";
import { CreateOngUseCase, GetOngUseCase } from "../../../ong/application/OngService";
import { UserRepository } from "../../domain/UserRepository";
import { OngRepository } from "../../../ong/domain/OngRepository";
import { JWTService } from "../jwtService";

class LoginAPIController {
  private getExternalDataService: GetExternalDataService;
  private createUserUseCase: CreateUserUseCase;
  private getUserUseCase: GetUserUseCase;
  private createOngUseCase: CreateOngUseCase;
  private getOngUseCase: GetOngUseCase;
  private jwtService: JWTService;

  constructor() {
    const userRepository = new UserRepository();
    const ongRepository = new OngRepository();

    this.getExternalDataService = new GetExternalDataService();
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.createOngUseCase = new CreateOngUseCase(ongRepository);
    this.getOngUseCase = new GetOngUseCase(ongRepository);
    this.jwtService = new JWTService();
  }

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as { email: string; password: string };

    try {
      const data = await this.getExternalDataService.execute({ email, password });

      if (!data.ngo) {
        throw new CustomError("Nenhuma ONG encontrada para este usuário.", 400);
      }

      const ngoData = data.ngo;
      const userData = data.user;

      let ngo = await this.getOngUseCase.executeById(ngoData.id);

      if (!ngo) {
        ngo = await this.createOngUseCase.execute({
          id: ngoData.id,
          name: ngoData.name,
          description: ngoData.description,
          is_formalized: ngoData.is_formalized,
          start_year: ngoData.start_year,
          contact_phone: ngoData.contact_phone,
          instagram_link: ngoData.instagram_link,
          x_link: ngoData.x_link,
          facebook_link: ngoData.facebook_link,
          pix_qr_code_link: ngoData.pix_qr_code_link,
          site: ngoData.site,
          gallery_images_url: ngoData.gallery_images_url,
          skills: ngoData.skills,
          causes: ngoData.causes,
          sustainable_development_goals: ngoData.sustainable_development_goals,
        });
      }

      let user = await this.getUserUseCase.executeByEmail(userData.email);

      if (!user) {
        user = await this.createUserUseCase.execute({
          name: userData.name,
          email: userData.email,
          ngoId: ngo.id,
        });
      }

      const token = this.jwtService.generateToken({ userId: user.id, ngoId: ngo.id });

      reply.send({ message: "Login bem-sucedido", user, ngo, token });
    } catch (error) {
      if (error instanceof CustomError) {
        reply.status(error.statusCode).send({ error: error.message });
      } else {
        reply.status(500).send({ error: "Erro ao processar login" });
      }
    }
  }
}

export { LoginAPIController };