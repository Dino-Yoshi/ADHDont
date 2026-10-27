import { z } from "zod";

const configSchema = z.object({ VITE_API_URL: z.string().url() });

export const config = configSchema.parse(import.meta.env);
