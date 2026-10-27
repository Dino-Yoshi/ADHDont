import { healthSchema } from "@adhdont/shared";
import { config } from "./config";

export async function getHealth() {
  const response = await fetch(`${config.VITE_API_URL}/health`);
  return healthSchema.parse(await response.json());
}
