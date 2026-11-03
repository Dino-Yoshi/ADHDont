import { buildApp } from "./app";
import { config } from "./config";

const app = await buildApp();
await app.listen({ host: "0.0.0.0", port: config.PORT });
