// rollup.config.js

import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import css from "rollup-plugin-css-only";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const emitCss = false;

const cmp = "Game";

export default {
  input: `test/${cmp}.svelte`,

  output: {
    format: "es",
    file: `dist/${cmp}.js`,
    sourcemap: true
  },

  plugins: [
    svelte({
      emitCss,
      compilerOptions: {
        dev: !production
      }
    }),

    emitCss && css({ output: `${cmp}.css` }),

    resolve({
      browser: true,
      dedupe: ["svelte"]
    }),
    commonjs(),
    production && terser()
  ]
};
