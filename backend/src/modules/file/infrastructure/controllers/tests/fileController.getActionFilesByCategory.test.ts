import { FileController } from "../FileController";
import { FastifyReply, FastifyRequest } from "fastify";
import { ActionParams } from "@routeParams/RouteParams";

describe("FileController - getActionFilesByCategory", () => {
  // Mock dos serviços
  const mockUploadOngFileService = {
    execute: jest.fn()
  };
  
  const mockUploadActionFileService = {
    execute: jest.fn()
  };
  
  const mockDeleteFileService = {
    execute: jest.fn()
  };
  
  const mockGetActionFilesByCategoryService = {
    execute: jest.fn()
  };
  
  const mockGetOngFilesByCategoryService = {
    execute: jest.fn()
  };
  
  // Mock do request e reply com tipagem correta
  const mockRequest = {
    params: {
      actionId: "1"
    }
  } as FastifyRequest<{
    Params: ActionParams
  }>;
  
  const mockReply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn()
  } as unknown as FastifyReply;

  // Instância do controller com os serviços mockados na ordem correta
  const fileController = new FileController(
    mockUploadOngFileService as any,
    mockUploadActionFileService as any,
    mockDeleteFileService as any,
    mockGetActionFilesByCategoryService as any,
    mockGetOngFilesByCategoryService as any
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return files for an action with the specified category", async () => {
    // Dados de mock
    const mockFiles = [
      { id: "1", name: "action-file1.jpg", category: "image", url: "http://example.com/action-file1.jpg" },
      { id: "2", name: "action-file2.jpg", category: "image", url: "http://example.com/action-file2.jpg" }
    ];
    
    // Configurar o mock para retornar arquivos
    mockGetActionFilesByCategoryService.execute.mockResolvedValue(mockFiles);
    
    // Chamar o método
    await fileController.getActionFilesByCategory(mockRequest, mockReply, "image");
    
    // Verificar se o serviço foi chamado com os parâmetros corretos
    expect(mockGetActionFilesByCategoryService.execute).toHaveBeenCalledWith("1", "image");
    
    // Verificar se a resposta foi enviada corretamente
    expect(mockReply.send).toHaveBeenCalledWith(mockFiles);
  });

  it("should handle errors and send appropriate error response", async () => {
    // Configurar o mock para lançar um erro
    mockGetActionFilesByCategoryService.execute.mockRejectedValue(new Error("Failed to fetch action files"));
    
    // Mock do console.error para suprimir logs durante os testes
    jest.spyOn(console, "error").mockImplementation(() => {});
    
    // Chamar o método
    await fileController.getActionFilesByCategory(mockRequest, mockReply, "report");
    
    // Verificar se o serviço foi chamado com os parâmetros corretos
    expect(mockGetActionFilesByCategoryService.execute).toHaveBeenCalledWith("1", "report");
    
    // Verificar se o status e resposta de erro foram enviados corretamente
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      error: "Erro interno ao buscar arquivos da categoria report"
    });
    
    // Restaurar console.error
    jest.restoreAllMocks();
  });

  it("should work with different categories", async () => {
    // Configurar o mock para retornar diferentes arquivos para diferentes categorias
    const mockVideoFiles = [
      { id: "3", name: "action-video.mp4", category: "video", url: "http://example.com/action-video.mp4" }
    ];
    
    const mockReportFiles = [
      { id: "4", name: "action-report.pdf", category: "report", url: "http://example.com/action-report.pdf" }
    ];
    
    // Primeiro teste com categoria vídeo
    mockGetActionFilesByCategoryService.execute.mockResolvedValueOnce(mockVideoFiles);
    await fileController.getActionFilesByCategory(mockRequest, mockReply, "video");
    expect(mockGetActionFilesByCategoryService.execute).toHaveBeenCalledWith("1", "video");
    expect(mockReply.send).toHaveBeenCalledWith(mockVideoFiles);
    
    // Limpar mocks
    jest.clearAllMocks();
    
    // Segundo teste com categoria relatório
    mockGetActionFilesByCategoryService.execute.mockResolvedValueOnce(mockReportFiles);
    await fileController.getActionFilesByCategory(mockRequest, mockReply, "report");
    expect(mockGetActionFilesByCategoryService.execute).toHaveBeenCalledWith("1", "report");
    expect(mockReply.send).toHaveBeenCalledWith(mockReportFiles);
  });
  
  it("should handle empty results", async () => {
    // Configurar o mock para retornar array vazio
    mockGetActionFilesByCategoryService.execute.mockResolvedValue([]);
    
    // Chamar o método
    await fileController.getActionFilesByCategory(mockRequest, mockReply, "other");
    
    // Verificar se o serviço foi chamado com os parâmetros corretos
    expect(mockGetActionFilesByCategoryService.execute).toHaveBeenCalledWith("1", "other");
    
    // Verificar se a resposta (array vazio) foi enviada corretamente
    expect(mockReply.send).toHaveBeenCalledWith([]);
  });
});