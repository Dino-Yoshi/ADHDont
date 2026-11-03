import { z } from "zod";

// No defaults: a build with a missing value must fail rather than ship a dead extension.
export const configSchema = z.object({
  WXT_API_URL: z.string().url(),
  WXT_PORTAL_DOMAIN: z.string().min(1),
  WXT_SUPABASE_URL: z.string().url(),
  WXT_SUPABASE_ANON_KEY: z.string().min(1),
});
