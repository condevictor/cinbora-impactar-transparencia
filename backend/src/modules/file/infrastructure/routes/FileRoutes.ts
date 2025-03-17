import { FastifyInstance } from "fastify";
import { fileController } from "@config/dependencysInjection/fileDependencyInjection"
import { authMiddleware } from "@middlewares/authMiddleware";
import { OngParams, ActionParams, DeleteParams } from "@routeParams/RouteParams";
import { deleteFileSchema, getOngFilesSchema, getActionFilesSchema } from "@modules/file"

async function fileRoutes(fastify: FastifyInstance) {
  fastify.post("/ongs/files/upload", { preHandler: [authMiddleware] }, fileController.uploadOngFile.bind(fileController));
  fastify.post<{ Params: ActionParams }>("/ongs/actions/:actionId/files/upload", { preHandler: [authMiddleware] }, fileController.uploadActionFile.bind(fileController));
  fastify.delete<{ Params: DeleteParams }>("/files/:id", { preHandler: [authMiddleware], schema: deleteFileSchema }, fileController.delete.bind(fileController));

  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/images", { schema: getOngFilesSchema }, fileController.getOngImages.bind(fileController));
  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/videos", { schema: getOngFilesSchema }, fileController.getOngVideos.bind(fileController));
  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/reports", { schema: getOngFilesSchema }, fileController.getOngReportFiles.bind(fileController));
  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/tax_invoices", { schema: getOngFilesSchema }, fileController.getOngTaxInvoicesFiles.bind(fileController));
  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/others", { schema: getOngFilesSchema }, fileController.getOngOtherFiles.bind(fileController));

  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/images", { schema: getActionFilesSchema }, fileController.getActionImages.bind(fileController));
  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/videos", { schema: getActionFilesSchema }, fileController.getActionVideos.bind(fileController));
  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/reports", { schema: getActionFilesSchema }, fileController.getActionReportFiles.bind(fileController));
  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/tax_invoices", { schema: getActionFilesSchema }, fileController.getActionTaxInvoicesFiles.bind(fileController));
  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/others", { schema: getActionFilesSchema }, fileController.getActionOtherFiles.bind(fileController));
}

export { fileRoutes };