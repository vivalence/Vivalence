import * as esbuild from "esbuild";
import { transformAsync } from "@babel/core";
import solid from "babel-preset-solid";

const entry = new URL("./mount.jsx", import.meta.url);
export const outfile = new URL("./bundle/app.mjs", import.meta.url);
const sheets = new URL("../../../../subsystems/sheets/index.js", import.meta.url);

const universal = {
  name: "solid-universal",
  setup(build) {
    build.onResolve({ filter: /^@vivalence\/sheets$/ }, () => ({ path: sheets.pathname }));
    build.onLoad({ filter: /\.jsx$/ }, async (file) => {
      const transformed = await transformAsync(await Deno.readTextFile(file.path), {
        filename: file.path,
        configFile: false,
        babelrc: false,
        presets: [[solid, { generate: "universal", moduleName: "@opentui/solid" }]],
      });
      return { contents: transformed.code, loader: "js" };
    });
  },
};

export const options = (out = outfile.pathname) => ({
  entryPoints: [entry.pathname],
  outfile: out,
  bundle: true,
  format: "esm",
  platform: "neutral",
  packages: "external",
  plugins: [universal],
  metafile: true,
  logLevel: "warning",
});

export async function bundle(out = outfile.pathname) {
  const result = await esbuild.build(options(out));
  await esbuild.stop();
  const bytes = Object.values(result.metafile.outputs).reduce((sum, output) => sum + output.bytes, 0);
  return { outfile: out, bytes };
}

export async function watch() {
  const context = await esbuild.context(options());
  await context.rebuild();
  await context.watch();
  return {
    stop: async () => {
      await context.dispose();
      await esbuild.stop();
    },
  };
}

if (import.meta.main) {
  const written = await bundle();
  console.log(`ghost app → ${written.outfile} ${written.bytes} bytes`);
}
