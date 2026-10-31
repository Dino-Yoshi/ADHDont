import {
  activeLockdownResponseSchema,
  isValidLockdownLength,
  lockdownEndTime,
  lockdownSchema,
  lockdownStatus,
  startLockdownBodySchema,
} from "@adhdont/shared";
import type { FastifyPluginAsync } from "fastify";
import type { z } from "zod";
import { sendDatabaseError } from "./database-error";
import { LOCKDOWN_COLUMNS, loadUnstoppedLockdowns, lockdownRowSchema } from "./lockdown-rows";

const ALREADY_ACTIVE_MESSAGE = "A lockdown is already active.";
const EXCLUSION_VIOLATION = "23P01";

type LockdownRecord = z.infer<typeof lockdownRowSchema>;

function toLockdownResponse(lockdown: LockdownRecord) {
  return lockdownSchema.parse({
    id: lockdown.id,
    domains: lockdown.domains,
    startedAt: lockdown.startedAt.toISOString(),
    endsAt: lockdown.endsAt.toISOString(),
  });
}

export const lockdownRoutes: FastifyPluginAsync = async (app) => {
  app.get("/lockdown", async (request, reply) => {
    const { error, lockdowns } = await loadUnstoppedLockdowns(request);
    if (error) return sendDatabaseError(request, reply, error, "Could not load your lockdown.");

    const now = new Date();
    const active = lockdowns.find((lockdown) => lockdownStatus(lockdown, now) === "active");
    return activeLockdownResponseSchema.parse(active ? toLockdownResponse(active) : null);
  });

  app.post("/lockdown", async (request, reply) => {
    const body = startLockdownBodySchema.safeParse(request.body);
    if (!body.success || !isValidLockdownLength(body.data.minutes)) {
      return reply.code(400).send({ message: "Pick a length from 5 minutes to 12 hours." });
    }

    const { error: loadError, lockdowns } = await loadUnstoppedLockdowns(request);
    if (loadError) {
      return sendDatabaseError(request, reply, loadError, "Could not start your lockdown.");
    }
    const now = new Date();
    if (lockdowns.some((lockdown) => lockdownStatus(lockdown, now) === "active")) {
      return reply.code(409).send({ message: ALREADY_ACTIVE_MESSAGE });
    }

    const { data: entries, error: entriesError } = await request.supabase
      .from("block_list_entries")
      .select("domain")
      .eq("user_id", request.userId)
      .order("domain", { ascending: true });
    if (entriesError) {
      return sendDatabaseError(request, reply, entriesError, "Could not start your lockdown.");
    }
    if (entries.length === 0) {
      return reply.code(400).send({ message: "Add a website to your block list first." });
    }

    const { data, error: insertError } = await request.supabase
      .from("lockdowns")
      .insert({
        user_id: request.userId,
        domains: entries.map(({ domain }) => domain),
        started_at: now.toISOString(),
        ends_at: lockdownEndTime(now, body.data.minutes).toISOString(),
      })
      .select(LOCKDOWN_COLUMNS)
      .single();
    // Two starts can pass the check above together; the database lets only one through.
    if (insertError?.code === EXCLUSION_VIOLATION) {
      return reply.code(409).send({ message: ALREADY_ACTIVE_MESSAGE });
    }
    if (insertError) {
      return sendDatabaseError(request, reply, insertError, "Could not start your lockdown.");
    }

    return reply.code(201).send(toLockdownResponse(lockdownRowSchema.parse(data)));
  });

  app.post("/lockdown/stop", async (request, reply) => {
    const { error: loadError, lockdowns } = await loadUnstoppedLockdowns(request);
    if (loadError) {
      return sendDatabaseError(request, reply, loadError, "Could not stop your lockdown.");
    }
    const now = new Date();
    const active = lockdowns.find((lockdown) => lockdownStatus(lockdown, now) === "active");
    if (!active) return reply.code(404).send({ message: "No lockdown is active." });

    const { data, error: updateError } = await request.supabase
      .from("lockdowns")
      .update({ stopped_at: now.toISOString() })
      .eq("id", active.id)
      .is("stopped_at", null)
      .select(LOCKDOWN_COLUMNS)
      .maybeSingle();
    if (updateError) {
      return sendDatabaseError(request, reply, updateError, "Could not stop your lockdown.");
    }
    if (!data) return reply.code(404).send({ message: "No lockdown is active." });

    return toLockdownResponse(lockdownRowSchema.parse(data));
  });
};
