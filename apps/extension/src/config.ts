import { z } from "zod";

const configSchema = z.object({
  WXT_API_URL: z.string().url().default("http://localhost:3000"),
  WXT_PORTAL_DOMAIN: z.string().default("adhdont.com"),
  WXT_SUPABASE_URL: z.string().url().default("https://your-project-ref.supabase.co"),
  WXT_SUPABASE_ANON_KEY: z.string().min(1).default("your-anon-key"),
});

export const config = configSchema.parse({
  WXT_API_URL: import.meta.env.WXT_API_URL,
  WXT_PORTAL_DOMAIN: import.meta.env.WXT_PORTAL_DOMAIN,
  WXT_SUPABASE_URL: import.meta.env.WXT_SUPABASE_URL,
  WXT_SUPABASE_ANON_KEY: import.meta.env.WXT_SUPABASE_ANON_KEY,
});
