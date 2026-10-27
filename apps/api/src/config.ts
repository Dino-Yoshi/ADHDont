import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  PORTAL_ORIGIN: z.string().url(),
});

export const config = configSchema.parse(process.env);
