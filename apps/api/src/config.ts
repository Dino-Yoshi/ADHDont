import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  PORTAL_ORIGIN: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
});

export const config = configSchema.parse(process.env);
