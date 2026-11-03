import { configSchema } from "./config-schema";

export const config = configSchema.parse({
  WXT_API_URL: import.meta.env.WXT_API_URL,
  WXT_PORTAL_DOMAIN: import.meta.env.WXT_PORTAL_DOMAIN,
  WXT_SUPABASE_URL: import.meta.env.WXT_SUPABASE_URL,
  WXT_SUPABASE_ANON_KEY: import.meta.env.WXT_SUPABASE_ANON_KEY,
});
