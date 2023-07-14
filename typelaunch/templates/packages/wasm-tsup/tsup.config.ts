import fs from "fs/promises";
import { defineConfig } from "tsup";

import { wasmLoader as wasm } from "esbuild-plugin-wasm";

interface Pkg {
  type?: "commonjs" | "module";
  main?: string;
  module: string;
}

const PKG_LOCATION = "./crate/dist/package.json";

export default defineConfig(({ minify }) => {
  const inProduction = !!minify;

  console.log(`Building for ${inProduction ? "production" : "development"}...`);

  return {
    dts: true,
    clean: true,
    minify,
    bundle: true,
    sourcemap: !inProduction,
    splitting: inProduction,
    treeshake: inProduction,
    format: "esm",
    entry: {
      core: "src/index.ts",
    },

    // May need to play with this setting if problems come up
    noExternal: ["@typelaunch-turbo/wasm-tsup-rs"],
    esbuildPlugins: [wasm({ mode: "deferred" })],

    // TODO move to separate cli
    async onSuccess() {
      const packageFileContent = await fs.readFile(PKG_LOCATION, "utf-8");
      const packageJSON: Pkg = JSON.parse(packageFileContent);

      packageJSON.type = "module";
      packageJSON.main = packageJSON.module;

      await fs.writeFile(
        PKG_LOCATION,
        JSON.stringify(packageJSON, null, 2),
        "utf-8",
      );
    },
  };
});
