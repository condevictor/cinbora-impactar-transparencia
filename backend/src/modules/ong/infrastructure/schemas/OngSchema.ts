import { z } from "zod";

const SkillSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const CauseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
});

const SustainableDevelopmentGoalSchema = z.object({
  id: z.number(),
  name: z.string(),
  url_ods: z.string(),
  logo_url: z.string(),
});

const NgoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  is_formalized: z.boolean().optional(),
  start_year: z.number().nullable().optional(),
  contact_phone: z.string().optional(),
  instagram_link: z.string().optional(),
  x_link: z.string().optional(),
  facebook_link: z.string().optional(),
  pix_qr_code_link: z.string().optional(),
  site: z.string().nullable().optional(),
  gallery_images_url: z.array(z.string()).optional(),
  skills: z.array(SkillSchema).optional(),
  causes: z.array(CauseSchema).optional(),
  sustainable_development_goals: z.array(SustainableDevelopmentGoalSchema).optional(),
});

const createOngSchema = {
  body: NgoSchema,
  response: {
    200: NgoSchema,
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

const updateOngSchema = {
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    is_formalized: z.boolean().optional(),
    start_year: z.number().nullable().optional(),
    contact_phone: z.string().optional(),
    instagram_link: z.string().optional(),
    x_link: z.string().optional(),
    facebook_link: z.string().optional(),
    pix_qr_code_link: z.string().optional(),
    site: z.string().nullable().optional(),
    gallery_images_url: z.array(z.string()).optional(),
    skills: z.array(SkillSchema).optional(),
    causes: z.array(CauseSchema).optional(),
    sustainable_development_goals: z.array(SustainableDevelopmentGoalSchema).optional(),
  }),
  response: {
    200: z.object({
      message: z.string(),
      ngo: NgoSchema,
    }),
  },
};

const updateNgoGraficSchema = {
  body: z.object({
    expensesByCategory: z.record(z.number()).optional(),
  }),
  response: {
    200: z.object({
      ngoId: z.number(),
      totalExpenses: z.number(),
      expensesByCategory: z.record(z.number()),
    }),
  },
};

const expensesByCategory = z.object({
  category1: z.number().optional(),
  catrgory2: z.number().optional(),
});

const ngoGraficSchema = z.object({
  id: z.string(),
  ngoId: z.number(),
  totalExpenses: z.number(),
  expensesByCategory: z.array(expensesByCategory).optional(),
  createdAt: z.union([z.string(), z.date()]).optional(), 
  updatedAt: z.union([z.string(), z.date()]).optional(), 
});

const getNgoAndGraficSchema = {
  response: {
    200: z.object({
      ngo: NgoSchema,
      ngoGrafic: ngoGraficSchema
    }),
  },
};

const NgoResponseSchema = NgoSchema.extend({
  createdAt: z.union([z.string(), z.date()]), 
  updatedAt: z.union([z.string(), z.date()]), 
});


const getNgosSchema = {
  response: {
    200: z.array(NgoResponseSchema),
  },
};

export { createOngSchema, deleteOngSchema, updateOngSchema, updateNgoGraficSchema, getNgoAndGraficSchema, getNgosSchema };
