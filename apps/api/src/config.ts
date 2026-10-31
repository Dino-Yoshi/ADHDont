import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  PORTAL_ORIGIN: z.string().url(),
  PORTAL_DOMAIN: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
});

export const config = configSchema.parse(process.env);
