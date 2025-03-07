import { FastifyInstance } from "fastify";
import { FileController } from "@modules/file";
import fastifyMultipart from "@fastify/multipart";
import { authMiddleware } from "@middlewares/authMiddleware";

const fileController = new FileController();

interface ActionParams {
  actionId: string;
}

interface DeleteParams {
  id: string;
}

async function fileRoutes(fastify: FastifyInstance) {
  fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // Limite de tamanho de arquivo de 10 MB
    },
  });

  fastify.post("/ongs/files/upload", { preHandler: [authMiddleware] }, fileController.uploadOngFile.bind(fileController));
  fastify.post<{ Params: ActionParams }>("/ongs/actions/:actionId/files/upload", { preHandler: [authMiddleware] }, fileController.uploadActionFile.bind(fileController));
  fastify.delete<{ Params: DeleteParams }>("/files/:id", { preHandler: [authMiddleware] }, fileController.delete.bind(fileController));

  fastify.get("/ongs/:ngoId/files/images", fileController.getOngImages.bind(fileController));
  fastify.get("/ongs/:ngoId/files/videos", fileController.getOngVideos.bind(fileController));
  fastify.get("/ongs/:ngoId/files/reports", fileController.getOngReportFiles.bind(fileController));
  fastify.get("/ongs/:ngoId/files/tax_invoices", fileController.getOngTaxInvoicesFiles.bind(fileController));
  fastify.get("/ongs/:ngoId/files/others", fileController.getOngOtherFiles.bind(fileController));

  fastify.get("/ongs/actions/:actionId/files/images", fileController.getActionImages.bind(fileController));
  fastify.get("/ongs/actions/:actionId/files/videos", fileController.getActionVideos.bind(fileController));
  fastify.get("/ongs/actions/:actionId/files/reports", fileController.getActionReportFiles.bind(fileController));
  fastify.get("/ongs/actions/:actionId/files/tax_invoices", fileController.getActionTaxInvoicesFiles.bind(fileController));
  fastify.get("/ongs/actions/:actionId/files/others", fileController.getActionOtherFiles.bind(fileController));
}

export { fileRoutes };

