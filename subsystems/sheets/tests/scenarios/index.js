import "../../host.js";
import { testRender } from "@opentui/solid";
import { tokens } from "@vivalence/dapper";
import * as esbuild from "esbuild";
import * as babel from "@babel/core";
import solid from "babel-preset-solid";

export const THEMES = ["northsea", "parchment", "porcelain", "datasette"];

export const ZONES = ["0", "1", "2", "3"];

export const settle = async (setup, passes = 4) => {
  for (let pass = 0; pass < passes; pass++) {
    await setup.renderOnce();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

export const screen = (part = () => [], options = {}) => testRender(part, { width: 100, height: 30, ...options });

export const frame = async (part, options) => {
  const setup = await screen(part, options);
  await settle(setup);
  const text = setup.captureCharFrame();
  setup.renderer.destroy();
  return text.replace(/\n$/, "");
};

export const palette = (theme = "northsea", zone = "2") =>
  new Proxy(tokens.camel(theme, zone), {
    get(held, name) {
      if (typeof name === "symbol" || Object.hasOwn(held, name)) return held[name];
      throw new Error(`[sheets] not a token: ${JSON.stringify(name)} · ${Object.keys(held).join(" · ")}`);
    },
  });

const universal = {
  name: "solid-universal",
  setup(build) {
    build.onLoad({ filter: /\.jsx$/ }, async (file) => {
      const transformed = await babel.transformAsync(await Deno.readTextFile(file.path), {
        filename: file.path,
        configFile: false,
        babelrc: false,
        presets: [[solid, { generate: "universal", moduleName: "@opentui/solid" }]],
      });
      return { contents: transformed.code, loader: "js" };
    });
  },
};

const ENTRIES = { parts: "../../index.js", design: "../../design/index.js" };

const compile = async () => {
  const directory = await Deno.makeTempDir({ prefix: "sheets-" });
  await esbuild.build({
    entryPoints: Object.fromEntries(Object.entries(ENTRIES).map(([name, entry]) => [name, new URL(entry, import.meta.url).pathname])),
    outdir: directory,
    bundle: true,
    format: "esm",
    platform: "neutral",
    packages: "external",
    plugins: [universal],
    logLevel: "silent",
  });
  await esbuild.stop();
  return Object.fromEntries(await Promise.all(Object.keys(ENTRIES).map(async (name) => [name, await import(`file://${directory}/${name}.js`)])));
};

const compiled = compile();

export const parts = compiled.then((held) => held.parts);

export const design = compiled.then((held) => held.design);
