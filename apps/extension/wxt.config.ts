import { defineConfig } from "wxt";

export default defineConfig({
  manifest: ({ browser }) => ({
    name: "ADHDont",
    permissions: ["storage"],
    host_permissions: ["http://localhost/*", "https://*/*"],
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              id: "adhdont@example.com",
              strict_min_version: "109.0",
            },
          },
        }
      : {}),
  }),
});
