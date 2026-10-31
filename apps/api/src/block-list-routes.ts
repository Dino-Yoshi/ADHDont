import {
  blockListResponseSchema,
  buildBlockList,
  DEFAULT_BLOCK_LIST,
  updateBlockListRequestSchema,
  updateBlockListResponseSchema,
} from "@adhdont/shared";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { config } from "./config";
import { sendDatabaseError } from "./database-error";

async function replaceBlockList(request: FastifyRequest, domains: string[]) {
  const { error: deleteError } = await request.supabase
    .from("block_list_entries")
    .delete()
    .eq("user_id", request.userId);
  if (deleteError) return deleteError;

  if (domains.length > 0) {
    const { error: insertError } = await request.supabase
      .from("block_list_entries")
      .insert(domains.map((domain) => ({ user_id: request.userId, domain })));
    if (insertError) return insertError;
  }

  const { error: profileError } = await request.supabase
    .from("profiles")
    .update({ block_list_seeded: true })
    .eq("id", request.userId);
  return profileError;
}

export const blockListRoutes: FastifyPluginAsync = async (app) => {
  app.get("/block-list", async (request, reply) => {
    const { data: profile, error: profileError } = await request.supabase
      .from("profiles")
      .select("block_list_seeded")
      .eq("id", request.userId)
      .single();
    if (profileError || !profile) {
      return sendDatabaseError(request, reply, profileError, "Could not load your block list.");
    }

    if (!profile.block_list_seeded) {
      const { error: seedError } = await request.supabase.from("block_list_entries").upsert(
        DEFAULT_BLOCK_LIST.map((domain) => ({ user_id: request.userId, domain })),
        { onConflict: "user_id,domain", ignoreDuplicates: true },
      );
      if (seedError) {
        return sendDatabaseError(
          request,
          reply,
          seedError,
          "Could not initialize your block list.",
        );
      }

      const { error: updateError } = await request.supabase
        .from("profiles")
        .update({ block_list_seeded: true })
        .eq("id", request.userId);
      if (updateError) {
        return sendDatabaseError(
          request,
          reply,
          updateError,
          "Could not initialize your block list.",
        );
      }
    }

    const { data: entries, error: entriesError } = await request.supabase
      .from("block_list_entries")
      .select("domain")
      .eq("user_id", request.userId)
      .order("domain", { ascending: true });
    if (entriesError) {
      return sendDatabaseError(request, reply, entriesError, "Could not load your block list.");
    }

    return blockListResponseSchema.parse({ domains: entries.map(({ domain }) => domain) });
  });

  app.put("/block-list", async (request, reply) => {
    const body = updateBlockListRequestSchema.safeParse(request.body);
    if (!body.success) return reply.code(400).send({ message: "Invalid block list." });

    const result = buildBlockList(body.data.entries, config.PORTAL_DOMAIN);
    const error = await replaceBlockList(request, result.domains);
    if (error) {
      return sendDatabaseError(request, reply, error, "Could not update your block list.");
    }

    return updateBlockListResponseSchema.parse(result);
  });

  app.post("/block-list/reset", async (request, reply) => {
    const error = await replaceBlockList(request, [...DEFAULT_BLOCK_LIST]);
    if (error) {
      return sendDatabaseError(request, reply, error, "Could not reset your block list.");
    }

    return blockListResponseSchema.parse({ domains: [...DEFAULT_BLOCK_LIST].sort() });
  });
};
