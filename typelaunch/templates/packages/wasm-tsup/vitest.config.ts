// Use Vitest instead of vite for types. See https://vitest.dev/config/#configuration
import { defineConfig } from "vitest/config";

import { ViteRsw as rsw } from "vite-plugin-rsw";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  test: {
    // Allow for Rust-like in-source testing. See https://vitest.dev/guide/in-source.html
    includeSource: ["src/**/*.{js,ts}"],
    coverage: { reporter: ["html-spa", "text"] },
  },
  define: {
    // See https://vitest.dev/guide/in-source.html#production-build
    "import.meta.vitest": "undefined",
  },

  plugins: [rsw(), wasm()],
});
