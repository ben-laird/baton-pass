import { defineConfig } from "tsup";

export default defineConfig(({ define }) => {
  const buildMode = expr(() => {
    if (define) {
      if (hasProp(define, "mode")) {
        return define.mode;
      }
    }
    return "unknown";
  });

  console.log(`Building in ${buildMode} mode...\n\n`);

  if (buildMode === "unknown") {
    return { name: buildMode, dts: true, clean: true };
  }

  const inProduction = buildMode === "production";

  return {
    name: buildMode,
    dts: true,
    clean: true,
    minify: inProduction,
    bundle: inProduction,
    splitting: inProduction,
    treeshake: inProduction,
    format: inProduction ? ["cjs", "esm"] : "esm",
    entry: {
      core: "src/index.ts",
    },
  };
});

function expr<T>(lam: () => T): T {
  return lam();
}

type HasProp<T extends string> = {
  [P in T]: string;
} & Record<string, string>;

function hasProp<P extends string,>(
  ob: Record<string, string>,
  prop: P,
): ob is HasProp<P> {
  return prop in ob;
}
