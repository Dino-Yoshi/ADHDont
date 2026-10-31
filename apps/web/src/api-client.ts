import {
  blockListResponseSchema,
  healthSchema,
  meResponseSchema,
  updateBlockListRequestSchema,
  updateBlockListResponseSchema,
} from "@adhdont/shared";
import { config } from "./config";
import { supabase } from "./supabase";

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const response = await fetch(`${config.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

export async function getBlockList() {
  return blockListResponseSchema.parse(await request("/block-list"));
}

export async function updateBlockList(entries: string[]) {
  const body = updateBlockListRequestSchema.parse({ entries });
  return updateBlockListResponseSchema.parse(
    await request("/block-list", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  );
}

export async function resetBlockList() {
  return blockListResponseSchema.parse(await request("/block-list/reset", { method: "POST" }));
}
