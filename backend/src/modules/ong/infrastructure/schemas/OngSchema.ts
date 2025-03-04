import { z } from "zod";

const SkillSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const CauseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
});

const SustainableDevelopmentGoalSchema = z.object({
  id: z.number(),
  name: z.string(),
  url_ods: z.string(),
  logo_url: z.string(),
});

const FileSchema = z.object({
  id: z.string(),
  name: z.string(),
  aws_url: z.string(),
  ngoId: z.number(),
  type: z.string(),
  size: z.number(),
});

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  ngoId: z.number(),
});

const ActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  ngoId: z.number(),
  current_value: z.number(),
  goal: z.number(),
});

const GraficSchema = z.object({
  id: z.string(),
  ngoId: z.number(),
  toalExpenses: z.number(),
  expensesByCategory: z.object({
    theme: z.string(),
    expense: z.number(),
  })
})

const NgoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  is_formalized: z.boolean().optional(),
  start_year: z.number().optional(),
  contact_phone: z.string().optional(),
  instagram_link: z.string().optional(),
  x_link: z.string().optional(),
  facebook_link: z.string().optional(),
  pix_qr_code_link: z.string().optional(),
  site: z.string().optional(),
  gallery_images_url: z.array(z.string()).optional(),
  skills: z.array(SkillSchema).optional(),
  causes: z.array(CauseSchema).optional(),
  sustainable_development_goals: z.array(SustainableDevelopmentGoalSchema).optional(),
  files: z.array(FileSchema).optional(),
  users: z.array(UserSchema).optional(),                       
  actions: z.array(ActionSchema).optional(),
  ngoGrafic: z.array(GraficSchema).optional(), 
});

const createOngSchema = {
  body: NgoSchema,
  response: {
    200: NgoSchema,
  },
};

const getOngSchema = {
    response: {
      200: z.array(z.any()),
    },
  };
  
const deleteOngSchema = {
  params: z.object({
    id: z.coerce.number(), // Convertendo o id de entrada da req http em number
  }),
  response: {
    200: z.object({
      message: z.string(),
    }),
  },
};

export { createOngSchema, deleteOngSchema, getOngSchema };
