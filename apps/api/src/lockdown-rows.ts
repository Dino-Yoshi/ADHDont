import type { FastifyRequest } from "fastify";
import { z } from "zod";

export const LOCKDOWN_COLUMNS = "id, domains, started_at, ends_at, stopped_at";

export const lockdownRowSchema = z
  .object({
    id: z.string(),
    domains: z.array(z.string()),
    started_at: z.coerce.date(),
    ends_at: z.coerce.date(),
    stopped_at: z.coerce.date().nullable(),
  })
  .transform((row) => ({
    id: row.id,
    domains: row.domains,
    startedAt: row.started_at,
    endsAt: row.ends_at,
    stoppedAt: row.stopped_at,
  }));

// A stopped lockdown is never active and earns no coins, so no caller needs those rows.
export async function loadUnstoppedLockdowns(request: FastifyRequest) {
  const { data, error } = await request.supabase
    .from("lockdowns")
    .select(LOCKDOWN_COLUMNS)
    .eq("user_id", request.userId)
    .is("stopped_at", null)
    .order("started_at", { ascending: false });
  if (error) return { error, lockdowns: [] };
  return { error: null, lockdowns: z.array(lockdownRowSchema).parse(data) };
}
