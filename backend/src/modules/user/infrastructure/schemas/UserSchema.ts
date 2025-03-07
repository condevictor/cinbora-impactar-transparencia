import { z } from "zod";

const createUserSchema = {
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    ngoId: z.number(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      user: z.any(),
    }),
    400: z.object({
      error: z.string().default("Requisição inválida"),
    }),
    500: z.object({
      error: z.string().default("Erro interno do servidor"),
    }),
  },
};

const getUserSchema = {
  response: {
    200: z.array(z.any()),
    500: z.object({
      error: z.string().default("Erro interno do servidor"),
    }),
  },
};

const deleteUserSchema = {
  params: z.object({
    id: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
    }),
    500: z.object({
      error: z.string().default("Erro interno do servidor"),
    }),
  },
};

export { createUserSchema, getUserSchema, deleteUserSchema };