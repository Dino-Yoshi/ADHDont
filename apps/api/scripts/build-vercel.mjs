// Builds the API as a Vercel Function using the Build Output API v3.
import { mkdir, rm, writeFile } from "node:fs/promises";
import { build } from "esbuild";

const outputDir = ".vercel/output";
const functionDir = `${outputDir}/functions/index.func`;

// Clear only the output, because .vercel also holds the project link.
await rm(outputDir, { recursive: true, force: true });
await mkdir(functionDir, { recursive: true });

await build({
  entryPoints: ["src/vercel-handler.ts"],
  outfile: `${functionDir}/index.cjs`,
  bundle: true,
  platform: "node",
  target: "node24",
  format: "cjs",
});

await writeFile(
  `${functionDir}/.vc-config.json`,
  JSON.stringify({
    runtime: "nodejs24.x",
    handler: "index.cjs",
    launcherType: "Nodejs",
    shouldAddHelpers: false,
    supportsResponseStreaming: true,
  }),
);
await writeFile(
  `${outputDir}/config.json`,
  JSON.stringify({ version: 3, routes: [{ src: "/(.*)", dest: "/index" }] }),
);
