import { coinBalance, meResponseSchema } from "@adhdont/shared";
import type { FastifyPluginAsync } from "fastify";
import { sendDatabaseError } from "./database-error";
import { loadUnstoppedLockdowns } from "./lockdown-rows";

export const meRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", async (request, reply) => {
    const { data, error } = await request.supabase
      .from("profiles")
      .select("username")
      .eq("id", request.userId)
      .single();
    if (error || !data) return reply.code(404).send({ message: "Profile not found." });

    const { error: lockdownsError, lockdowns } = await loadUnstoppedLockdowns(request);
    if (lockdownsError) {
      return sendDatabaseError(request, reply, lockdownsError, "Could not load your coins.");
    }

    return meResponseSchema.parse({
      username: data.username,
      coins: coinBalance(lockdowns, new Date()),
    });
  });
};
