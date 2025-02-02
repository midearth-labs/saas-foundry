import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: [
    "./src/link/index.tsx",
    "./src/counter-button/index.tsx",
    "./src/blog/index.tsx",
    "./src/styles/globals.css"
  ],
  format: ["cjs", "esm"],
  external: ["react"],
  banner: {
    js: "'use client'",
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  ...options,
}));
