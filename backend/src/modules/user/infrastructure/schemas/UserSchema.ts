import { z } from "zod";

const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      token: z.string(),
      user: z.any(),
      ngo: z.any(), 
    }),
    400: z.object({
      error: z.string(),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
};

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
      error: z.string(),
    }),
    500: z.object({
      error: z.string(),
    }),
  },
};

const getUserSchema = {
  response: {
    200: z.array(z.any()),
    500: z.object({
      error: z.string(),
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
      error: z.string(),
    }),
  },
};

export { loginSchema, createUserSchema, getUserSchema, deleteUserSchema };