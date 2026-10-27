import { healthSchema, meResponseSchema } from "@adhdont/shared";
import { config } from "./config";
import { supabase } from "./supabase";

async function request(path: string): Promise<unknown> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const response = await fetch(`${config.VITE_API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error(`Request to ${path} failed with ${response.status}`);
  return response.json();
}

export async function getHealth() {
  return healthSchema.parse(await request("/health"));
}

export async function getMe() {
  return meResponseSchema.parse(await request("/me"));
}
