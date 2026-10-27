import { healthSchema } from "@adhdont/shared";

// Proves the shared package is wired into the extension.
console.log(healthSchema.parse({ ok: true }));
