import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const pkg = JSON.parse(readFileSync(here("../package.json"), "utf8")) as { version: string };

// Builds the whole app (HTML + JS + CSS) into ONE self-contained file.
// scripts/finalize-web.mjs then adds the Content-Security-Policy and renames it to keyzer.html.
export default defineConfig({
  root: here("."),
  plugins: [viteSingleFile()],
  define: { __VERSION__: JSON.stringify(pkg.version) },
  build: {
    outDir: here("../dist-web"),
    emptyOutDir: true,
    target: "es2022",
    modulePreload: false,
    reportCompressedSize: false,
  },
});
