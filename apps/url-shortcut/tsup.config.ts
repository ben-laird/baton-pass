import { defineConfig } from "tsup";

export default defineConfig(({ minify }) => {
  const inProduction = !!minify;

  console.log(`Building for ${inProduction ? "production" : "development"}...`);

  return {
    dts: true,
    clean: true,
    minify,
    bundle: inProduction,
    splitting: inProduction,
    treeshake: inProduction,
    format: ["cjs", "esm"],
    entry: {
      core: "src/index.ts",
    },
  };
});
