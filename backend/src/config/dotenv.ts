import dotenv from 'dotenv';

dotenv.config();

export const config = {
  secretKey: process.env.SECRET_KEY as string,
  databaseUrl: process.env.DATABASE_URL,
  apiLink: process.env.API_LINK,
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsS3BucketName: process.env.AWS_S3_BUCKET_NAME,
};