import { z } from "zod";

export const apiErrorSchema = z.object({ message: z.string() });
export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;
