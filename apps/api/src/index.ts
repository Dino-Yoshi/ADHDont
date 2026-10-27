import { healthSchema } from "@adhdont/shared";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { config } from "./config";

const app = Fastify({ logger: true });

await app.register(cors, { origin: config.PORTAL_ORIGIN });

app.get("/health", async () => healthSchema.parse({ ok: true }));

await app.listen({ host: "0.0.0.0", port: config.PORT });
