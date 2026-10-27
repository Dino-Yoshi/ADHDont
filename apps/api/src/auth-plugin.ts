import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { FastifyInstance } from "fastify";
import { config } from "./config";

declare module "fastify" {
  // Must be an interface: module augmentation only merges interfaces.
  interface FastifyRequest {
    userId: string;
    // Acts as the caller, so row-level security applies to its queries.
    supabase: SupabaseClient;
  }
}

const BEARER_PREFIX = "Bearer ";

// Not a separate plugin: hooks only cover routes in the same scope, so the caller registers
// its routes in the scope it passes here.
export function requireLogin(app: FastifyInstance) {
  app.decorateRequest("userId", "");
  app.decorateRequest("supabase");

  app.addHook("onRequest", async (request, reply) => {
    const header = request.headers.authorization;
    const token = header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length) : null;
    if (!token) return reply.code(401).send({ message: "Please log in." });

    const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `${BEARER_PREFIX}${token}` } },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return reply.code(401).send({ message: "Please log in." });

    request.userId = data.user.id;
    request.supabase = supabase;
  });
}
