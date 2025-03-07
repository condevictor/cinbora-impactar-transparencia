import { GetExternalDataService } from "@modules/authAPI";
import { CustomError } from "@middlewares/customError";
import { JWTService } from "@shared/jwtService";
import { CreateUserUseCase, GetUserUseCase, UserRepository } from "@modules/user";
import { CreateOngUseCase, GetOngUseCase, OngRepository } from "@modules/ong";
import { GetActionUseCase, ActionRepository } from "@modules/action";

class AuthController {
  private getExternalDataService: GetExternalDataService;
  private createUserUseCase: CreateUserUseCase;
  private getUserUseCase: GetUserUseCase;
  private createOngUseCase: CreateOngUseCase;
  private getOngUseCase: GetOngUseCase;
  private getActionUseCase: GetActionUseCase;
  private jwtService: JWTService;

  constructor() {
    const userRepository = new UserRepository();
    const ongRepository = new OngRepository();
    const actionRepository = new ActionRepository();

    this.getExternalDataService = new GetExternalDataService();
    this.createUserUseCase = new CreateUserUseCase(userRepository);
    this.getUserUseCase = new GetUserUseCase(userRepository);
    this.createOngUseCase = new CreateOngUseCase(ongRepository);
    this.getOngUseCase = new GetOngUseCase(ongRepository);
    this.getActionUseCase = new GetActionUseCase(actionRepository);
    this.jwtService = new JWTService();
  }

  async authenticate(email: string, password: string) {
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

    const token = this.jwtService.generateToken({ userId: user.id, name: user.name, email: user.email, ngoId: user.ngoId });

    // Buscar ações da ONG
    const actions = await this.getActionUseCase.executeByNgoId(ngo.id.toString());

    return { user, ngo, token, actions };
  }
}

export { AuthController };