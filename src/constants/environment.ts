import "dotenv/config";
import { z } from "zod";

interface EnvVars {
  PORT: string;
  MONGODB_URL: string;
  APP_ORIGIN: string;
  JWT_KEY: string;
  PRIVATE_GOOGLE_CLIENT_ID: string;
  PRIVATE_GOOGLE_CLIENT_SECRET: string;
  REDIRECT_URL: string;
}

const envSchema = z.object({
  PORT: z.string(),
  MONGODB_URL: z.string(),
  APP_ORIGIN: z.string(),
  JWT_KEY: z.string(),
  PRIVATE_GOOGLE_CLIENT_ID: z.string(),
  PRIVATE_GOOGLE_CLIENT_SECRET: z.string(),
  REDIRECT_URL: z.string(),
});

const { error, data } = envSchema.safeParse(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = data;

export const envs = {
  PORT: envVars.PORT,
  MONGODB_URL: envVars.MONGODB_URL,
  APP_ORIGIN: envVars.APP_ORIGIN,
  JWT_KEY: envVars.JWT_KEY,
  PRIVATE_CLIENT_ID: envVars.PRIVATE_GOOGLE_CLIENT_ID,
  PRIVATE_CLIENT_SECRET: envVars.PRIVATE_GOOGLE_CLIENT_SECRET,
  REDIRECT_URL: envVars.REDIRECT_URL,
};
