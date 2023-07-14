import { resolve } from "path";
// Use Vitest instead of vite for types. See https://vitest.dev/config/#configuration
import { defineConfig } from "vitest/config";

import dts from "vite-plugin-dts";
import solid from "vite-plugin-solid";

export default defineConfig(({ mode, command }) => {
  const inPreviewMode = mode === "preview";
  const inBuildDevMode = mode === "development" && command === "build";

  return {
    build: {
      // Use the dev server style build for previewing your build,
      // otherwise build like a library
      lib: !inPreviewMode
        ? {
            entry: resolve(__dirname, "src/index.ts"),
            name: "ExternalVite", // Only needed in umd or iife formats
          }
        : false,
      // Allow easier debugging by source-mapping & turning off minifying in dev builds
      minify: inBuildDevMode ? false : "esbuild",
      sourcemap: inBuildDevMode,
      emptyOutDir: true,
    },
    test: {
      // Allow for Rust-like in-source testing. See https://vitest.dev/guide/in-source.html
      includeSource: ["src/**/*.{js,ts}"],
      coverage: { reporter: ["html-spa", "text"] },
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
      solid(),
    ],
  };
});
