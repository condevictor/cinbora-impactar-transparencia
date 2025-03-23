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
      categorysExpenses: z.array(z.any()),
    }),
  },
};

export { createActionSchema, updateActionSchema, deleteActionSchema, updateActionExpensesGraficSchema };