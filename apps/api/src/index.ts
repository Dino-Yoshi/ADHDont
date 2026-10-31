import { healthSchema } from "@adhdont/shared";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { requireLogin } from "./auth-plugin";
import { blockListRoutes } from "./block-list-routes";
import { config } from "./config";
import { lockdownRoutes } from "./lockdown-routes";
import { meRoutes } from "./me-routes";

const app = Fastify({ logger: true });

// The extension's origin is its own scheme, so match any extension.
await app.register(cors, {
  origin: [config.PORTAL_ORIGIN, /^(chrome|moz)-extension:\/\//],
  methods: ["GET", "HEAD", "POST", "PUT"],
});

app.get("/health", async () => healthSchema.parse({ ok: true }));

// Every route registered inside here needs a valid login.
await app.register(async (authed) => {
  requireLogin(authed);
  await authed.register(meRoutes);
  await authed.register(blockListRoutes);
  await authed.register(lockdownRoutes);
});

await app.listen({ host: "0.0.0.0", port: config.PORT });
