import type { SupportedStorage } from "@supabase/supabase-js";
import { browser } from "wxt/browser";

export const STORAGE_KEYS = {
  SUPABASE_SESSION: "adhdont_supabase_session",
} as const;

export const extensionStorageAdapter: SupportedStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const data = await browser.storage.local.get(key);
    const value = data[key];
    return typeof value === "string" ? value : null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await browser.storage.local.set({ [key]: value });
  },
  removeItem: async (key: string): Promise<void> => {
    await browser.storage.local.remove(key);
  },
};
