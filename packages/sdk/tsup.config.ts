import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    deployment: "src/deployment/index.ts",
    subscriptions: "src/subscriptions/index.ts",
    decoders: "src/decoders/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  shims: true,
  outDir: "dist",
});
