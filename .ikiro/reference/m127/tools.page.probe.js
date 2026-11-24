// limit: 7500 chars
// probe: the copy's own StepTab.svelte (guide editor) and Inspector.svelte (model editor) mounted in a real page,
// their new controls clicked, every call they make recorded on window.probe. the verbs' schema is the copy's own,
// stripped as the model editor's /schematics strips it. serves on a FREE port.
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/tools.page.probe.js <root holding edit/>
import { mime, v } from "@vivalence/typology";
import paladin from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/mod.js";

const A = `${Deno.args[0]}/edit/assembly`;
const NPM = `${Deno.env.get("HOME")}/Library/Caches/deno/npm/registry.npmjs.org`;
const directory = await Deno.makeTempDir({ prefix: "tools-page-" });
const bundler = paladin.bundler(directory);
const tab = await bundler.bundle({ mime: mime.dom.svelte, entry: `${A}/modes/guide/editor/buffer/parts/StepTab.svelte` });
const inspector = await bundler.bundle({ mime: mime.dom.svelte, entry: `${A}/modes/model/editor/buffer/parts/Inspector.svelte` });
const { VERBS } = await import(`${A}/domain/assembly/schematics.js`);
const SHAPES = { VERBS: Object.fromEntries(Object.entries(VERBS).map(([name, fields]) => [name, JSON.parse(JSON.stringify(v.object(fields)))])) };

const MOUNTS = [
  ["/bundle/", `${directory}/bundle`],
  ["/three/", `${NPM}/three/0.186.0`],
  ["/svelte/", `${NPM}/svelte/5.57.3/src`],
  ["/clsx/", `${NPM}/clsx/2.1.1/dist`],
];
const IMPORTS = {
  three: "/three/build/three.module.js",
  "three/addons/": "/three/examples/jsm/",
  svelte: "/svelte/index-client.js",
  "svelte/internal/client": "/svelte/internal/client/index.js",
  "svelte/internal/disclose-version": "/svelte/internal/disclose-version.js",
  "svelte/events": "/svelte/events/index.js",
  "svelte/reactivity": "/svelte/reactivity/index-client.js",
  "#client/constants": "/svelte/internal/client/constants.js",
  "esm-env": "/shim/esm-env.js",
  clsx: "/clsx/clsx.mjs",
};
const at = (bundle) => bundle.json.entries[0].mount.replace("/", "/bundle/");

const PAGE = `<!doctype html>
<script type="importmap">${JSON.stringify({ imports: IMPORTS })}</script>
<style>
  body { margin: 0; display: flex; gap: 24px; font: 13px sans-serif; --font-family-body: sans-serif; --font-family-code: monospace;
    --paper: #fff; --paper-2: #eef0f4; --ink: #17214d; --ink-2: #1f2433; --dim: #6b7280; --iron: #9aa0ab; --line: #d5d9e0; --hair: #d5d9e0;
    --tip: #3b6fd1; --tip-surface: #eef3fb; --warn-bg: #fdf0df; --warn-ink: #a85500; --warn-edge: #c46a0a; --radius: 4px;
    --pick: #e6efff; --pick-edge: #3b82f6; --pick-ink: #17214d;
    --tint-info: #3b6fd1; --tint-success: #4f9a47; --tint-warning: #d98a1c; --tint-danger: #c0392b; --tint-accent: #7c5cc4; --tint-contrast: #9aa3b5; }
  #tab, #inspector { width: 380px; padding: 12px; background: #fff; }
</style>
<div id="tab"></div><div id="inspector"></div>
<script type="module">
  import { flushSync } from "svelte";
  import StepTab from "${at(tab)}";
  import Inspector from "${at(inspector)}";

  const calls = [];
  const ins = { name: "The printed tail", lines: [], images: [], notes: [{ text: "Arrow must be pointing to the front.", kind: "ORIENTATION" }, { text: "pinned", at: { literals: ["a", "b"] }, images: ["manual/x.webp"] }], staged: { placements: [{ literal: "stack.fc.0", status: "ghost" }] } };
  const ctl = new Proxy({}, {
    get: (_, name) => (...args) => {
      if (name !== "editStep") return calls.push([name, ...args]);
      const held = JSON.parse(JSON.stringify(ins));
      args[0](held);
      calls.push(["editStep", held.notes]);
    },
  });
  const looks = {
    selected: ["tail.tail_half_b.0"],
    entries: [{ literal: "stack.fc.0", status: "ghost", name: "Flight controller", summary: "ghost" }],
    shared: {},
    seat: [0.0547, 0, 0],
  };
  const pre = { summary: "all earlier", custom: false, items: [], q: "", steps: [], types: [] };
  const scope = { here: 0, filters: [["step", "Step"]], filter: "step", q: "", types: [], selected: 0, removable: false, pullable: false, pullLabel: "Pull", emptyText: "none" };
  StepTab(document.getElementById("tab"), { ins, n: 18, steps: [], pre, scope, images: [], tools: [], names: {}, tintsOpen: null, folding: null, looks, asset: (path) => "/none/" + path, ctl });

  const card = { slug: "hinge", ontology: "part", name: "Hinge", mode: "model", symbols: [], trait: { LABELED: { name: "Hinge" }, STAGED: { colour: "warning" } } };
  const coloured = [];
  Inspector(document.getElementById("inspector"), { card, count: 1, shapes: ${JSON.stringify(SHAPES)}, vocabulary: {}, siblings: [], onstate: () => {}, onsave: () => {}, onmove: () => {}, onretract: () => {}, oncolour: (colour) => coloured.push(colour) });
  flushSync();

  const tabPane = document.getElementById("tab");
  const button = (text) => [...tabPane.querySelectorAll("button")].find((one) => one.textContent.trim() === text);
  const titled = (pane, title) => pane.querySelector('[title="' + title + '"]');
  button("ghost").click();
  button("as built").click();
  titled(tabPane, "warning").click();
  titled(tabPane, "Its own").click();
  button("off").click();
  const seat = tabPane.querySelector(".look-vector");
  const placeholder = seat.placeholder;
  seat.value = "0.05, 0.06, 0";
  seat.dispatchEvent(new Event("change", { bubbles: true }));
  titled(tabPane, "Say nothing about it").click();
  titled(tabPane, "Select it").click();
  titled(tabPane, "Pin this note to the pieces selected on the stage").click();
  titled(tabPane, "Take it off the stage").click();
  [...tabPane.querySelectorAll('[title="Pictures from the manual"]')][0].click();
  titled(tabPane, "Remove manual/x.webp").click();

  const pane = document.getElementById("inspector");
  const swatches = [...pane.querySelectorAll(".swatch")];
  const lit = swatches.filter((one) => one.classList.contains("on")).map((one) => one.title);
  titled(pane, "info").click();
  titled(pane, "its file's own").click();
  const hex = pane.querySelector(".hex");
  hex.value = "#e8590c";
  hex.dispatchEvent(new Event("change", { bubbles: true }));

  window.probe = { calls, placeholder, heads: [...tabPane.querySelectorAll(".h")].map((one) => one.textContent.trim()), swatches: swatches.map((one) => one.title), lit, coloured };
  document.title = "probed";
</script>`;

const TYPES = { js: "text/javascript", mjs: "text/javascript" };
const server = Deno.serve({ port: 0, onListen: ({ port }) => console.log(`http://localhost:${port}/`) }, async (request) => {
  const { pathname } = new URL(request.url);
  if (pathname === "/") return new Response(PAGE, { headers: { "content-type": "text/html" } });
  if (pathname === "/shim/esm-env.js") {
    return new Response("export const BROWSER = true; export const DEV = false; export const NODE = false;", { headers: { "content-type": "text/javascript" } });
  }
  const held = MOUNTS.find(([prefix]) => pathname.startsWith(prefix));
  const bytes = held ? await Deno.readFile(`${held[1]}/${pathname.slice(held[0].length)}`).catch(() => null) : null;
  if (!bytes) return new Response("no", { status: 404 });
  return new Response(bytes, { headers: { "content-type": TYPES[pathname.split(".").pop()] ?? "application/octet-stream" } });
});
await server.finished;
