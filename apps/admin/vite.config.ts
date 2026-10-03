// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { fileURLToPath } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const fromRoot = (dir: string) => fileURLToPath(new URL(`../../${dir}`, import.meta.url));

export default defineConfig({
  vite: {
    // Le fichier .env est commun aux deux applications, à la racine du dépôt.
    envDir: "../..",
    // Code commun aux deux applications
    resolve: {
      alias: {
        "@core": fromRoot("packages/core/src"),
        "@ui": fromRoot("packages/ui/src"),
      },
    },
    server: { port: 8081 },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
