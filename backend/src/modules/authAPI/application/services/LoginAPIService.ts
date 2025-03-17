import axios from "axios";
import { CustomError } from "../../../../shared/customError";
import { config } from '@config/dotenv';

interface GetDataProps {
  email: string;
  password: string;
}

class GetExternalDataService {
  async execute({ email, password }: GetDataProps) {
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
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new CustomError(error.response?.data.message || "Erro ao buscar dados da API externa com axios", error.response?.status || 500);
      } else if (error instanceof Error) {
        throw new CustomError(error.message || "Erro ao buscar dados da API externa.", 500);
      } else {
        throw new CustomError("Erro desconhecido ao buscar dados da API externa.", 500);
      }
    }
  }
}

export { GetExternalDataService };