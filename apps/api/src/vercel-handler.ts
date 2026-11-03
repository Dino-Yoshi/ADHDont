import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "./app";

let appReady: ReturnType<typeof buildApp> | undefined;

async function getApp() {
  appReady ??= buildApp().then(async (app) => {
    await app.ready();
    return app;
  });
  return appReady;
}

// Vercel requires a default export. The bundle is CommonJS, so nothing here uses top-level await.
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const app = await getApp();
  app.server.emit("request", req, res);
}
