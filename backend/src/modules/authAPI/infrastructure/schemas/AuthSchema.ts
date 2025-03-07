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
      actions: z.array(z.any()), // Adicionando ações na resposta
    }),
    400: z.object({
      error: z.string().default("Requisição inválida"),
    }),
    500: z.object({
      error: z.string().default("Erro interno do servidor"),
    }),
  },
};

export { loginSchema };