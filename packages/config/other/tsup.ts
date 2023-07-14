import { defineConfig, type Options } from "tsup";

export const tsupOptions: Options = {
  dts: true,
  clean: true,
  format: ["cjs", "esm"],
  entry: {
    core: "src/index.ts",
  },
};

export const tsupConfig = defineConfig(tsupOptions);
