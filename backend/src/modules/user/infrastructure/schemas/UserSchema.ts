import { z } from "zod";

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  ngoId: z.number(),
  createdAt: z.union([z.string(), z.date()]).optional(), 
  updatedAt: z.union([z.string(), z.date()]).optional(), 
});

const createUserSchema = {
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    ngoId: z.number(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      user: userSchema,
    }),
  },
};

const getUserSchema = {
  response: {
    200: z.array(userSchema),
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
  },
};

export { createUserSchema, getUserSchema, deleteUserSchema };