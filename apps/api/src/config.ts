import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  // Normalised to an origin so a trailing slash or path cannot break the CORS match.
  PORTAL_ORIGIN: z
    .string()
    .url()
    .transform((value) => new URL(value).origin),
  PORTAL_DOMAIN: z.string().min(1),
  API_DOMAIN: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
});

export const config = configSchema.parse(process.env);
