import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig, type UserConfigExport } from "vitest/config";

export const vitestOptions: UserConfigExport = {
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "typelaunch-starter",
      fileName: "typelaunch-starter",
    },
  },
  test: {
    includeSource: ["src/**/*.{js,ts}"],
    coverage: { reporter: ["html-spa", "text"] },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
  plugins: [dts()],
};

export const vitestConfig = defineConfig(vitestOptions);
