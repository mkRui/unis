import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import { reassign } from "rollup-plugin-reassign";
import { unisFns } from "@unis/unis";

/**
 * @param {*} format
 * @returns {import('rollup').RollupOptions}
 */
const configGen = (format) =>
  defineConfig({
    input: "src/index.ts",
    external: ["@unis/unis", "history"],
    output: [
      {
        dir: "dist",
        entryFileNames: `index.${format === "esm" ? "mjs" : "js"}`,
        format,
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      esbuild({
        sourceMap: true,
        target: "esnext",
      }),
      reassign({
        include: ["**/*.(t|j)s?(x)"],
        targetFns: {
          "@unis/unis": unisFns,
        },
      }),
    ],
  });

const config = [configGen("cjs"), configGen("esm")];

export default config;