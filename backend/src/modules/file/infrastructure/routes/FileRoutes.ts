import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { fileController } from "@config/dependencysInjection/fileDependencyInjection"
import { authMiddleware } from "@middlewares/authMiddleware";
import { OngParams, ActionParams, DeleteParams } from "@routeParams/RouteParams";
import { deleteFileSchema, getOngFilesSchema, getActionFilesSchema } from "@modules/file"
import { cachedRoute, invalidateCachePattern } from "@middlewares/cacheMiddleware";
import { CustomError } from "@shared/customError";

type RouteHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

interface ActionFileDeleteParams extends DeleteParams {
  actionId: string;
}

async function fileRoutes(fastify: FastifyInstance) {
  
  // Upload routes with category-specific cache invalidation
  fastify.post("/ongs/files/upload", 
    { preHandler: [authMiddleware] }, 
    async (request, reply) => {
      try {
        // Call controller but don't send response yet
        const fileEntity = await fileController.uploadOngFile(request, reply);
        
        // Invalidate cache first, then send response
        if (fileEntity && fastify.redis && request.user) {
          const cacheCategory = fileController.getCacheCategory(fileEntity.category);
          const cachePath = `cache:/ongs/${request.user.ngoId}/files/${cacheCategory}*`;
          
          try {
            await invalidateCachePattern(fastify.redis, cachePath);
          } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
          }
        }
        
        // Now send the response
        return reply.send(fileEntity);
      } catch (error) {
        if (error instanceof CustomError) {
          return reply.status(error.statusCode).send({ error: error.message });
        } else {
          return reply.status(500).send({ error: "Erro interno ao fazer upload do arquivo" });
        }
      }
    }
  );
  
  fastify.post<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/upload", 
    { preHandler: [authMiddleware] }, 
    async (request, reply) => {
      try {
        // Call controller but don't send response yet
        const fileEntity = await fileController.uploadActionFile(request, reply);
        
        // Invalidate cache first, then send response
        if (fileEntity && fastify.redis && request.params.actionId) {
          const cacheCategory = fileController.getCacheCategory(fileEntity.category);
          const cachePath = `cache:/ongs/actions/${request.params.actionId}/files/${cacheCategory}*`;
          
          try {
            await invalidateCachePattern(fastify.redis, cachePath);
          } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
          }
        }
        
        // Now send the response
        return reply.send(fileEntity);
      } catch (error) {
        if (error instanceof CustomError) {
          return reply.status(error.statusCode).send({ error: error.message });
        } else {
          return reply.status(500).send({ error: "Erro interno ao fazer upload do arquivo" });
        }
      }
    }
  );
  
  // Delete routes with route-specific cache invalidation
  fastify.delete<{ Params: DeleteParams }>(
    "/ongs/files/:id", 
    { preHandler: [authMiddleware], schema: deleteFileSchema }, 
    async (request, reply) => {
      try {
        // Call controller but don't send response yet
        const result = await fileController.delete(request, reply);
        
        // Invalidate cache first, then send response
        if (result && fastify.redis && request.user) {
          const cacheCategory = fileController.getCacheCategory(result.category);
          const cachePath = `cache:/ongs/${request.user.ngoId}/files/${cacheCategory}*`;
          
          try {
            await invalidateCachePattern(fastify.redis, cachePath);
          } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
          }
        }
        
        // Now send the response
        return reply.send({ 
          message: "Arquivo deletado com sucesso", 
          category: result.category
        });
      } catch (error) {
        if (error instanceof CustomError) {
          return reply.status(error.statusCode).send({ error: error.message });
        } else {
          return reply.status(500).send({ error: "Erro interno ao deletar arquivo" });
        }
      }
    }
  );
  
  fastify.delete<{ Params: ActionFileDeleteParams }>(
    "/ongs/actions/:actionId/files/:id", 
    { preHandler: [authMiddleware], schema: deleteFileSchema }, 
    async (request, reply) => {
      try {
        // Call controller but don't send response yet
        const result = await fileController.delete(request, reply);
        
        // Invalidate cache first, then send response
        if (result && fastify.redis && request.params.actionId) {
          const cacheCategory = fileController.getCacheCategory(result.category);
          const cachePath = `cache:/ongs/actions/${request.params.actionId}/files/${cacheCategory}*`;
          
          try {
            await invalidateCachePattern(fastify.redis, cachePath);
          } catch (cacheError) {
            console.error('Error invalidating cache:', cacheError);
          }
        }
        
        // Now send the response
        return reply.send({ 
          message: "Arquivo deletado com sucesso", 
          category: result.category
        });
      } catch (error) {
        if (error instanceof CustomError) {
          return reply.status(error.statusCode).send({ error: error.message });
        } else {
          return reply.status(500).send({ error: "Erro interno ao deletar arquivo" });
        }
      }
    }
  );

  // Get ONG file routes with caching
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/images", 
    { schema: getOngFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngImages(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
  
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/videos", 
    { schema: getOngFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngVideos(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
  
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/reports", 
    { schema: getOngFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngReportFiles(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
  
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/tax_invoices", 
    { schema: getOngFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngTaxInvoicesFiles(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
  
  fastify.get<{ Params: OngParams }>(
    "/ongs/:ngoId/files/others", 
    { schema: getOngFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getOngOtherFiles(request as FastifyRequest<{ Params: OngParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );

  // Get Action file routes with caching
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/images", 
    { schema: getActionFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionImages(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
  
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/videos", 
    { schema: getActionFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionVideos(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
  
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/reports", 
    { schema: getActionFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionReportFiles(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
  
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/tax_invoices", 
    { schema: getActionFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionTaxInvoicesFiles(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
  
  fastify.get<{ Params: ActionParams }>(
    "/ongs/actions/:actionId/files/others", 
    { schema: getActionFilesSchema }, 
    cachedRoute(
      fastify, 
      ((request, reply) => fileController.getActionOtherFiles(request as FastifyRequest<{ Params: ActionParams }>, reply)) as RouteHandler,
      { ttl: 604800 }
    )
  );
}

export { fileRoutes };