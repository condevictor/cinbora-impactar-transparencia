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
      actions: z.array(z.any()), 
    }),
  },
};

export { loginSchema };