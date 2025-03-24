import { z } from "zod";

const deleteFileSchema = { 
    params: z.object({ 
        id: z.string(), 
    }), 
    response: { 
        200: z.object({ 
            message: z.string(), 
        }), 
    }, 
};

const getOngFilesSchema = { 
    params: z.object({ 
        ngoId: z.string(), 
    }), 
    response: { 
        200: z.array(z.object({ 
            id: z.string(), 
            aws_name: z.string(),
            name: z.string(), 
            category: z.string(), 
            aws_url: z.string(),
            ngoId: z.number(), 
            mime_type: z.string(), 
            size: z.number(),
            createdAt: z.union([z.string(), z.date()]), 
            updatedAt: z.union([z.string(), z.date()]), 
        })),
    }, 
};

const getActionFilesSchema = { 
    params: z.object({ 
        actionId: z.string(),
    }), 
    response: { 
        200: z.array(z.object({ 
            id: z.string(), 
            aws_name: z.string(), 
            name: z.string(), 
            category: z.string(), 
            aws_url: z.string(), 
            mime_type: z.string(), 
            size: z.number(), 
            actionId: z.string(),
            ngoId: z.number(),
            createdAt: z.union([z.string(), z.date()]), 
            updatedAt: z.union([z.string(), z.date()]),
        })),
    }, 
};

export { deleteFileSchema, getOngFilesSchema, getActionFilesSchema };

