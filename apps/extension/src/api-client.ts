import { type MeResponse, meResponseSchema } from "@adhdont/shared";
import { config } from "./config";
import { supabase } from "./supabase";

async function request(path: string): Promise<unknown> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("Please log in.");
  }

  const response = await fetch(`${config.WXT_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    let message = `Request to ${path} failed with ${response.status}`;
    try {
      const errorJson = (await response.json()) as { message?: string };
      if (errorJson?.message) {
        message = errorJson.message;
      }
    } catch {
      // Keep default message
    }
    throw new Error(message);
  }

  return response.json();
}

export async function getMe(): Promise<MeResponse> {
  return meResponseSchema.parse(await request("/me"));
}
