import { type Lockdown, lockdownSchema } from "@adhdont/shared";
import type { SupportedStorage } from "@supabase/supabase-js";
import { browser } from "wxt/browser";

export const STORAGE_KEYS = {
  SUPABASE_SESSION: "adhdont_supabase_session",
  ACTIVE_LOCKDOWN: "adhdont_active_lockdown",
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

export async function getStoredLockdown(): Promise<Lockdown | null> {
  const data = await browser.storage.local.get(STORAGE_KEYS.ACTIVE_LOCKDOWN);
  const raw: unknown = data[STORAGE_KEYS.ACTIVE_LOCKDOWN];
  if (!raw) return null;
  const parsed = lockdownSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function setStoredLockdown(lockdown: Lockdown): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEYS.ACTIVE_LOCKDOWN]: lockdown });
}

export async function removeStoredLockdown(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEYS.ACTIVE_LOCKDOWN);
}
