import { z } from "zod";

export const meResponseSchema = z.object({
  username: z.string(),
  coins: z.number().int().nonnegative(),
});
export type MeResponse = z.infer<typeof meResponseSchema>;
