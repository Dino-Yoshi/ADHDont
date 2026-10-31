import {
  activeLockdownResponseSchema,
  apiErrorSchema,
  blockListResponseSchema,
  healthSchema,
  lockdownSchema,
  meResponseSchema,
  startLockdownBodySchema,
  updateBlockListRequestSchema,
  updateBlockListResponseSchema,
} from "@adhdont/shared";
import { config } from "./config";
import { supabase } from "./supabase";

// Its message comes from the API and is safe to show the user.
export class ApiError extends Error {}

async function readErrorMessage(response: Response) {
  try {
    return apiErrorSchema.parse(await response.json()).message;
  } catch {
    return "Something went wrong. Try again.";
  }
}

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
  if (!response.ok) throw new ApiError(await readErrorMessage(response));
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

export async function getLockdown() {
  return activeLockdownResponseSchema.parse(await request("/lockdown"));
}

export async function startLockdown(minutes: number) {
  const body = startLockdownBodySchema.parse({ minutes });
  return lockdownSchema.parse(
    await request("/lockdown", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
}

export async function stopLockdown() {
  return lockdownSchema.parse(await request("/lockdown/stop", { method: "POST" }));
}
