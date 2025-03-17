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
      aws_url: z.string().optional(), // Adicionando aws_url à resposta
    }),
    500: z.object({
      error: z.string().default("Erro interno do servidor"),
    }),
  },
};

const updateActionSchema = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    type: z.string().optional(),
    spent: z.number().optional(),
    goal: z.number().optional(),
    colected: z.number().optional(),
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
    500: z.object({
      error: z.string().default("Erro interno do servidor"),
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
    500: z.object({
      error: z.string().default("Erro interno do servidor"),
    }),
  },
};

const updateActionExpensesGraficSchema = {
  params: z.object({
    actionId: z.string(),
  }),
  body: z.object({
    categorysExpenses: z.record(z.number()).optional(),
  }),
  response: {
    200: z.object({
      actionId: z.string(),
      categorysExpenses: z.array(z.record(z.number())),
    }),
    500: z.object({
      error: z.string().default("Erro interno do servidor"),
    }),
  },
};

export { createActionSchema, updateActionSchema, deleteActionSchema, updateActionExpensesGraficSchema };