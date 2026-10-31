import type { FastifyReply, FastifyRequest } from "fastify";

export function sendDatabaseError(
  request: FastifyRequest,
  reply: FastifyReply,
  error: unknown,
  message: string,
) {
  request.log.error({ err: error }, message);
  return reply.code(500).send({ message });
}
