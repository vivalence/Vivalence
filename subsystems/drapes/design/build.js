import * as esbuild from "esbuild";
import { emit, scales, THEMES } from "@vivalence/dapper";
import { compile } from "../tests/scenarios/index.js";

const HERE = new URL("./", import.meta.url).pathname;
const OUT = `${HERE}out/`;
const NODE_MODULES = new URL("../../../node_modules/", import.meta.url).pathname;
const VIKET = new URL(import.meta.resolve("@vivalence/dapper/assets/viket/pic-vinca-viket_white.svg")).pathname;

await Deno.mkdir(OUT, { recursive: true });
await esbuild.build({
  entryPoints: [`${HERE}index.jsx`],
  bundle: true,
  format: "esm",
  platform: "browser",
  outfile: `${OUT}design.js`,
  nodePaths: [NODE_MODULES],
  plugins: [compile],
  logLevel: "warning",
});
await esbuild.stop();
await Deno.writeTextFile(`${OUT}tokens.css`, [scales(), ...Object.entries(THEMES).map(([name, held]) => emit(name, held))].join("\n"));
await Deno.copyFile(`${HERE}../parts.css`, `${OUT}parts.css`);
await Deno.copyFile(VIKET, `${OUT}pic-vinca-viket_white.svg`);
console.log(`built ${OUT}: design.js · tokens.css · parts.css · pic-vinca-viket_white.svg`);
