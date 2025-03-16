import { FastifyInstance } from "fastify";
import { fileController } from "@config/dependencysInjection/fileDependencyInjection"
import { authMiddleware } from "@middlewares/authMiddleware";
import { cacheMiddleware } from "@middlewares/cacheMiddleware";
import { OngParams, ActionParams, DeleteParams } from "@routeParams/RouteParams";
import { deleteFileSchema, getOngFilesSchema, getActionFilesSchema } from "@modules/file"

async function fileRoutes(fastify: FastifyInstance) {
  fastify.post("/ongs/files/upload", { preHandler: [authMiddleware] }, fileController.uploadOngFile.bind(fileController));
  fastify.post<{ Params: ActionParams }>("/ongs/actions/:actionId/files/upload", { preHandler: [authMiddleware] }, fileController.uploadActionFile.bind(fileController));
  fastify.delete<{ Params: DeleteParams }>("/files/:id", { preHandler: [authMiddleware], schema: deleteFileSchema }, fileController.delete.bind(fileController));

  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/images", { preHandler: cacheMiddleware(300), schema: getOngFilesSchema }, fileController.getOngImages.bind(fileController));
  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/videos", { preHandler: cacheMiddleware(300), schema: getOngFilesSchema }, fileController.getOngVideos.bind(fileController));
  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/reports", { preHandler: cacheMiddleware(300), schema: getOngFilesSchema }, fileController.getOngReportFiles.bind(fileController));
  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/tax_invoices", { preHandler: cacheMiddleware(300), schema: getOngFilesSchema }, fileController.getOngTaxInvoicesFiles.bind(fileController));
  fastify.get<{ Params: OngParams }>("/ongs/:ngoId/files/others", { preHandler: cacheMiddleware(300), schema: getOngFilesSchema }, fileController.getOngOtherFiles.bind(fileController));

  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/images", { preHandler: cacheMiddleware(300), schema: getActionFilesSchema }, fileController.getActionImages.bind(fileController));
  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/videos", { preHandler: cacheMiddleware(300), schema: getActionFilesSchema }, fileController.getActionVideos.bind(fileController));
  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/reports", { preHandler: cacheMiddleware(300), schema: getActionFilesSchema }, fileController.getActionReportFiles.bind(fileController));
  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/tax_invoices", { preHandler: cacheMiddleware(300), schema: getActionFilesSchema }, fileController.getActionTaxInvoicesFiles.bind(fileController));
  fastify.get<{ Params: ActionParams }>("/ongs/actions/:actionId/files/others", { preHandler: cacheMiddleware(300), schema: getActionFilesSchema }, fileController.getActionOtherFiles.bind(fileController));
}

export { fileRoutes };