import { defineConfig } from "wxt";

export default defineConfig({
  manifest: ({ browser }) => ({
    name: "ADHDont",
    permissions: ["declarativeNetRequest", "storage", "alarms", "notifications"],
    host_permissions: ["http://localhost/*", "https://*/*"],
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
              strict_min_version: "109.0",
            },
          },
        }
      : {}),
  }),
});
