import { meResponseSchema } from "@adhdont/shared";
import type { FastifyPluginAsync } from "fastify";

export const meRoutes: FastifyPluginAsync = async (app) => {
  app.get("/me", async (request, reply) => {
    const { data, error } = await request.supabase
      .from("profiles")
      .select("username")
      .eq("id", request.userId)
      .single();
    if (error || !data) return reply.code(404).send({ message: "Profile not found." });

    // Coins are always 0 until the lockdown ticket.
    return meResponseSchema.parse({ username: data.username, coins: 0 });
  });
};
