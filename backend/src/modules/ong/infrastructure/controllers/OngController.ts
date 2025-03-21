import { FastifyRequest } from "fastify";
import { OngProps, GetOngService, CreateOngService, DeleteOngService, UpdateOngService, UpdateNgoGraficService } from "@modules/ong";
import { getOngService, deleteOngService, createOngService, updateOngService, updateNgoGraficService } from "@config/dependencysInjection/ongDependencyInjection";
import { logService } from "@config/dependencysInjection/logDependencyInjection";
import { CustomError } from "@shared/customError";

class OngController {
  private getOngService: GetOngService;
  private deleteOngService: DeleteOngService;
  private createOngService: CreateOngService;
  private updateOngService: UpdateOngService;
  private updateNgoGraficService: UpdateNgoGraficService;

  constructor() {
    this.getOngService = getOngService;
    this.deleteOngService = deleteOngService;
    this.createOngService = createOngService;
    this.updateOngService = updateOngService;
    this.updateNgoGraficService = updateNgoGraficService;
  }

  async getAll() {
    try {
      return await this.getOngService.execute();
    } catch (error) {
      console.error("Erro ao obter ONGs:", error);
      throw new CustomError("Erro ao obter ONGs", 500);
    }
  }

  async getOneWithGrafic(request: FastifyRequest) {
    const { id } = request.params as { id: string };
    try {
      const ngo = await this.getOngService.executeById(id);
      const ngoGrafic = await this.getOngService.getGraficByNgoId(id);
      return { ngo, ngoGrafic };
    } catch (error) {
      console.error("Erro ao obter ONG com gráfico:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao obter ONG com gráfico", 500);
    }
  }

  async update(request: FastifyRequest) {
    const data = request.body as Partial<OngProps>;
    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }
    
    try {
      const updatedOng = await this.updateOngService.execute(request.user.ngoId, data);
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "ATUALIZAR", "ONG", request.user.ngoId.toString(), data, "ONG atualizada");
      return { message: "ONG atualizada com sucesso", ngo: updatedOng };
    } catch (error) {
      console.error("Erro ao atualizar ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar ONG", 500);
    }
  }

  async updateNgoGrafic(request: FastifyRequest) {
    const { totalExpenses, expensesByCategory } = request.body as {
      totalExpenses?: number;
      expensesByCategory?: Record<string, number>;
    };
    
    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }
    
    try {
      const updatedGrafic = await this.updateNgoGraficService.execute(request.user.ngoId, { totalExpenses, expensesByCategory });
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "ATUALIZAR", "Gráfico ONG", request.user.ngoId.toString(), { totalExpenses, expensesByCategory }, "Gráfico da ONG atualizado");
      return updatedGrafic;
    } catch (error) {
      console.error("Erro ao atualizar gráfico da ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao atualizar gráfico da ONG", 500);
    }
  }

  async delete(request: FastifyRequest) {
    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const { id } = request.params as { id: string };
    try {
      await this.deleteOngService.execute({ id });
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "DELETAR", "ONG", id, {}, "ONG deletada");
      return { message: "ONG deletada com sucesso" };
    } catch (error) {
      console.error("Erro ao deletar ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao deletar ONG", 500);
    }
  }

  async create(request: FastifyRequest) {
    if (!request.user) {
      throw new CustomError("Usuário não autenticado", 401);
    }

    const data = request.body as OngProps;
    try {
      const ong = await this.createOngService.execute(data);
      await logService.logAction(request.user.ngoId, request.user.id, request.user.name, "CRIAR", "ONG", ong.id.toString(), data, "ONG criada");
      return ong;
    } catch (error) {
      console.error("Erro ao criar ONG:", error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Erro ao criar ONG", 500);
    }
  }
}

export { OngController };