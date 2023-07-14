import { resolve } from "path";
import fs from "fs/promises";
// Use Vitest instead of vite for types. See https://vitest.dev/config/#configuration
import { defineConfig } from "vitest/config";

import dts from "vite-plugin-dts";
import { ViteRsw as rsw } from "vite-plugin-rsw";
import solid from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

interface Pkg {
  type?: "commonjs" | "module";
  main?: string;
  module: string;
}

const PKG_LOCATION = "./crate/dist/package.json";

// TODO move to separate cli
async function fixWasmPackage() {
  const packageFileContent = await fs.readFile(PKG_LOCATION, "utf-8");
  const packageJSON: Pkg = JSON.parse(packageFileContent);

  packageJSON.type = "module";
  packageJSON.main = packageJSON.module;

  await fs.writeFile(
    PKG_LOCATION,
    JSON.stringify(packageJSON, null, 2),
    "utf-8",
  );
}

export default defineConfig(async ({ mode, command }) => {
  const inPreviewMode = mode === "preview";
  const inBuildDevMode = mode === "development" && command === "build";

  await fixWasmPackage();

  return {
    build: {
      // Use the dev server style build for previewing your build,
      // otherwise build like a library
      lib: !inPreviewMode
        ? {
            entry: resolve(__dirname, "src/index.ts"),
            formats: ["es"],
          }
        : false,
      // Allow easier debugging by source-mapping & turning off minifying in dev builds
      minify: inBuildDevMode ? false : "esbuild",
      sourcemap: inBuildDevMode,
      emptyOutDir: true,
      target: "esnext",
    },

    test: {
      // Allow for Rust-like in-source testing. See https://vitest.dev/guide/in-source.html
      includeSource: ["src/**/*.{js,ts}"],
      coverage: { reporter: ["html-spa", "text"] },
      environment: "happy-dom",
    },
    define: {
      // See https://vitest.dev/guide/in-source.html#production-build
      "import.meta.vitest": "undefined",
    },

    plugins: [
      // No need for type declarations when previewing
      !inPreviewMode
        ? dts({ include: "src/**", exclude: "src/main.tsx" })
        : undefined,
      wasm(),
      rsw(),
      solid(),
    ],
  };
});
