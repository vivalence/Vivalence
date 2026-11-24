// limit: 5000 chars
import { compile, screen, settle } from "@vivalence/drapes/scenarios";
import * as esbuild from "esbuild";
import { atom } from "nanostores";
import { crypto, mime, Url } from "@vivalence/typology";

const WIDGET = new URL("../../../systems/anima/src/surfaces/chrome/widgets/buffer/", import.meta.url).pathname;
const PARTS = new URL("../../../subsystems/drapes/parts.js", import.meta.url).pathname;
const NODE_MODULES = new URL("../../../node_modules/", import.meta.url).pathname;
const ENTRY = `export * from "./painters.jsx"; export { render } from "solid-js/web";`;

const drapes = {
  name: "drapes-parts",
  setup(build) {
    build.onResolve({ filter: /^@vivalence\/drapes\/parts$/ }, () => ({ path: PARTS }));
  },
};

const built = await esbuild.build({
  stdin: { contents: ENTRY, resolveDir: WIDGET, loader: "js" },
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
  external: ["@vivalence/typology", "@vivalence/ghost", "@vivalence/dapper", "nanostores"],
  nodePaths: [NODE_MODULES],
  plugins: [drapes, compile],
  logLevel: "silent",
});
await esbuild.stop();
const directory = await Deno.makeTempDir({ prefix: "attached-404-mount-" });
await Deno.writeTextFile(`${directory}/surface.js`, built.outputFiles[0].text);
const surface = await import(`file://${directory}/surface.js`);

const MODULE = `export default (element) => { element.textContent = "mounted"; globalThis.MOUNTS = (globalThis.MOUNTS ?? 0) + 1; return { destroy() { globalThis.DESTROYS = (globalThis.DESTROYS ?? 0) + 1; } }; };`;
const integrity = `sha256-${await crypto.digest(MODULE)}`;

let route = false;
const hits = [];
const fetched = globalThis.fetch;
globalThis.fetch = async (url) => {
  hits.push(route ? 200 : 404);
  if (!route) return new Response("no route", { status: 404 });
  return new Response(MODULE, { headers: { "x-viva-integrity": integrity } });
};

const $status = atom({ code: "UNAVAILABLE" });
const file = { id: "f-1", path: "bundle/a.mjs", mime: mime.javascript, integrity };
const view = { slug: "reader", entry: "bundle/a.mjs", files: [file] };
const buffer = { mode: { daemon: null }, $trait: atom({}), attach() {}, detach() {} };
const terminal = { client: { runtime: { $status, attach: { url: new Url("http://probe.invalid/attached") } } } };

const seen = [];
const shot = (step, rig) =>
  seen.push({
    step,
    status: $status.get().code,
    fetches: [...hits],
    fault: rig.target.querySelector("[role=alert] .neg:last-child")?.textContent ?? null,
    mount: rig.target.querySelector(".mount").textContent,
    mounts: globalThis.MOUNTS ?? 0,
    destroys: globalThis.DESTROYS ?? 0,
  });
const beat = async () => {
  for (let turn = 0; turn < 5; turn++) await settle();
};

try {
  const rig = screen(() => surface.Mounted({ terminal, buffer, views: [view], picked: (held, views) => views[0] }), { render: surface.render });
  await beat();
  shot("host UNAVAILABLE", rig);
  $status.set({ code: "HEALTHY" });
  await beat();
  shot("host HEALTHY, route absent", rig);
  $status.set({ code: "UNAVAILABLE" });
  await beat();
  shot("host drops", rig);
  route = true;
  $status.set({ code: "HEALTHY" });
  await beat();
  shot("host HEALTHY, route mounted", rig);
  $status.set({ code: "UNAVAILABLE" });
  await beat();
  $status.set({ code: "HEALTHY" });
  await beat();
  shot("a later restart", rig);
  rig.close();
  await beat();
  shot("closed", { target: { querySelector: () => ({ textContent: "" }) } });
  console.log(JSON.stringify(seen, null, 1));
} finally {
  globalThis.fetch = fetched;
  await Deno.remove(directory, { recursive: true });
}
