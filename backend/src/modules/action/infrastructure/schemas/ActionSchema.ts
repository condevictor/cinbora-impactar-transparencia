import { z } from "zod";

const createActionSchema = {
  response: {
    200: z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      ngoId: z.number(),
      spent: z.number(),
      goal: z.number(),
      colected: z.number(),
      aws_url: z.string().optional(),
    }),
  },
};

const updateActionSchema = {
  params: z.object({
    id: z.string(),
  }),
  response: {
    200: z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      ngoId: z.number(),
      spent: z.number(),
      goal: z.number(),
      colected: z.number(),
      aws_url: z.string().optional(), 
    }),
  },
};

const deleteActionSchema = {
  params: z.object({
    id: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
    }),
  },
};

export { createActionSchema, updateActionSchema, deleteActionSchema };