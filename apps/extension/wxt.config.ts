import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { defineConfig } from "wxt";
import { configSchema } from "./src/config-schema";

export default defineConfig({
  hooks: {
    // Runs for build, zip and dev, but not for `wxt prepare`, which has no env on CI.
    "build:before": (wxt) => {
      let values: Record<string, string | undefined> = process.env;
      if (wxt.config.mode === "prod") {
        // Read only .env.prod, so a key missing there cannot fall back to the local .env.
        const file = join(wxt.config.root, ".env.prod");
        if (!existsSync(file)) {
          throw new Error("A production build needs apps/extension/.env.prod.");
        }
        values = parseEnv(readFileSync(file, "utf-8"));
      }
      const result = configSchema.safeParse(values);
      if (!result.success) {
        const keys = result.error.issues.map((issue) => issue.path.join("."));
        throw new Error(`Extension env is missing or invalid: ${keys.join(", ")}`);
      }
    },
  },
  manifest: ({ browser }) => ({
    name: "ADHDont",
    permissions: ["declarativeNetRequest", "storage", "alarms", "notifications"],
    // The redirect rule needs host access to the request URL, so cover plain http too.
    host_permissions: ["http://*/*", "https://*/*"],
    web_accessible_resources: [
      {
        resources: ["blocked.html"],
        matches: ["<all_urls>"],
      },
    ],
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              id: "adhdont@example.com",
              // First Firefox release with declarativeNetRequest.
              strict_min_version: "113.0",
            },
          },
        }
      : {}),
  }),
});
