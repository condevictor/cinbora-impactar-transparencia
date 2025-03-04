import axios from "axios";
import { CustomError } from "@middlewares/customError";
import { config } from '@config/dotenv';

interface GetExternalDataProps {
  email: string;
  password: string;
}

class GetExternalDataService {
  async execute({ email, password }: GetExternalDataProps) {
    try {
      const apiLink = config.apiLink;

      if (!apiLink) {
        throw new CustomError("API_LINK não está definido nas variáveis de ambiente.", 500);
      }

      const response = await axios.post(apiLink, { email, password });

      if (!response.data.user || !response.data.ngo) {
        throw new CustomError("Credenciais inválidas", 401);
      }

      return response.data;
    } catch (error: any) {

      if (error.response) {
        throw new CustomError(error.response.data.message || "Erro ao buscar dados da API externa.", error.response.status);
      } else {
        throw new CustomError(error.message || "Erro ao buscar dados da API externa.", 500);
      }
    }
  }
}

export { GetExternalDataService };