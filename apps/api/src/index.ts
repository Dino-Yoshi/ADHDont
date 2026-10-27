import { healthSchema } from "@adhdont/shared";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { requireLogin } from "./auth-plugin";
import { config } from "./config";
import { meRoutes } from "./me-routes";

const app = Fastify({ logger: true });

// The extension's origin is its own scheme, so match any extension.
await app.register(cors, {
  origin: [config.PORTAL_ORIGIN, /^(chrome|moz)-extension:\/\//],
});

app.get("/health", async () => healthSchema.parse({ ok: true }));

// Every route registered inside here needs a valid login.
await app.register(async (authed) => {
  requireLogin(authed);
  await authed.register(meRoutes);
});

await app.listen({ host: "0.0.0.0", port: config.PORT });
