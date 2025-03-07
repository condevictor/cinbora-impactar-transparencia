import dotenv from 'dotenv';

dotenv.config();

export const config = {
  secretKey: process.env.SECRET_KEY as string,
  databaseUrl: process.env.DATABASE_URL,
  apiLink: process.env.API_LINK,
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
};