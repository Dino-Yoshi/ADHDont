import { createClient } from "@supabase/supabase-js";
import { config } from "./config";
import { extensionStorageAdapter, STORAGE_KEYS } from "./storage";

export const supabase = createClient(config.WXT_SUPABASE_URL, config.WXT_SUPABASE_ANON_KEY, {
  auth: {
    storage: extensionStorageAdapter,
    storageKey: STORAGE_KEYS.SUPABASE_SESSION,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
