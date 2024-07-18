import "dotenv/config";
import { z } from "zod";

interface EnvVars {
  PORT: string;
  MONGODB_URL: string;
}

const envSchema = z.object({
  PORT: z.string(),
  MONGODB_URL: z.string(),
});

const { error, data } = envSchema.safeParse(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = data;

export const envs = {
  PORT: envVars.PORT,
  MONGODB_URL: envVars.MONGODB_URL,
};
