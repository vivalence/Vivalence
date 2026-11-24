// limit: 7500 chars
// probe: the copy's own Stage.svelte mounted in a real page over his interceptor — a step's pose, labels, a callout.
// bundles the kit's Stage through paladin's bundler, serves it with svelte 5.57.3 · three 0.186.0 (deno's npm cache),
// the copy's kit and domain, his dataset and freight, on a FREE port. the page folds `interceptor`, builds two steps
// (01 installs everything · 02 says the looks), mounts Stage at step 2, and leaves on window.probe: where three groups
// sit at step 1 and at step 2, the pins the kit read, the spots the stage answered, the boxes the pane drew.
// run: deno run -A --no-check --config deno.jsonc .ikiro/reference/m127/stage.page.probe.js <root holding edit/>
import { mime } from "@vivalence/typology";
import paladin from "/Users/finn/vivalence/code/vivalence/subsystems/paladin/mod.js";

const A = `${Deno.args[0]}/edit/assembly`;
const NPM = `${Deno.env.get("HOME")}/Library/Caches/deno/npm/registry.npmjs.org`;
const DRONEAID = "/Users/finn/.viva/registry/droneaid/topographies";
const directory = await Deno.makeTempDir({ prefix: "stage-page-" });
const bundle = await paladin.bundler(directory).bundle({ mime: mime.dom.svelte, entry: `${A}/modes/guide/editor/buffer/kit/Stage.svelte` });

const MOUNTS = [
  ["/bundle/", `${directory}/bundle`],
  ["/kit/", `${A}/modes/guide/editor/buffer/kit`],
  ["/domain/", `${A}/domain/assembly`],
  ["/dataset/", `${DRONEAID}/models/dataset/literals`],
  ["/freight/", `${DRONEAID}/models/freight`],
  ["/pictures/", `${DRONEAID}/guides/freight`],
  ["/three/", `${NPM}/three/0.186.0`],
  ["/svelte/", `${NPM}/svelte/5.57.3/src`],
  ["/clsx/", `${NPM}/clsx/2.1.1/dist`],
];
const TYPES = { js: "text/javascript", mjs: "text/javascript", glb: "model/gltf-binary", webp: "image/webp" };
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

const PAGE = `<!doctype html>
<script type="importmap">${JSON.stringify({ imports: IMPORTS })}</script>
<style>
  body { margin: 0; background: #eef0f3; font-family: sans-serif; --font-family-body: sans-serif; }
  #pane { position: relative; width: 1200px; height: 700px;
    --paper: #fff; --ink: #17214d; --hair: #d5d9e0; --tip: #3b6fd1; --tip-surface: #eef3fb;
    --warn-bg: #fdf0df; --warn-ink: #a85500; --warn-edge: #c46a0a;
    --stage-fresh: #f6c630; --stage-picked: #3b82f6; --stage-ghost: #9aa3b5; --stage-edge: #1a1d24;
    --stage-edge-light: #9aa1ad; --stage-edge-fresh: #6b4e00; --stage-edge-ghost: #5b6475; --stage-edge-picked: #1d4ed8;
    --tint-info: #3b6fd1; --tint-success: #4f9a47; --tint-warning: #d98a1c; --tint-danger: #c0392b;
    --tint-accent: #7c5cc4; --tint-contrast: #9aa3b5; }
</style>
<div id="pane"></div>
<script type="module">
  import { flushSync } from "svelte";
  import { proxy } from "svelte/internal/client";
  import Stage from "${bundle.json.entries[0].mount.replace("/", "/bundle/")}";
  import { resolve } from "/domain/resolve.js";
  import { entries, seats } from "/kit/frames.js";
  import { pins, posed, staged, statuses, tints } from "/kit/guide.js";
  import parts from "/dataset/parts.js";
  import placements from "/dataset/placements.js";

  const rows = new Map([...parts, ...placements].map((one) => [one.slug, one]));
  const fold = resolve(rows, "interceptor");
  const half = fold.placements.find((one) => one.slug === "tail.tail_half_b.0");
  const head = fold.placements.find((one) => one.slug === "interceptor.head.0");
  const lifted = (one, by) => (one.translation ?? [0, 0, 0]).map((value, k) => value + by[k]);
  const steps = [
    { slug: "p.01", trait: { ASSEMBLED: { placements: fold.placements.map((one) => ({ literal: one.slug, active: true })) } } },
    { slug: "p.02", trait: { ASSEMBLED: { placements: [] }, STAGED: { placements: [
      { literal: "tail.tail_half_b.0", translation: lifted(half, [0, 0.06, 0]), label: true },
      { literal: "interceptor.head.0", translation: lifted(head, [0, 0.08, 0]), label: true },
      { literal: "stack.fc.0", colour: "#e8590c" },
      { literal: "interceptor.drive.0", status: "ghost" },
    ] } } },
  ];
  const notes = [
    { text: "plain, panel only" },
    { text: "Arrow must be pointing to the front (camera side).", kind: "ORIENTATION", images: ["manual/61bb4ea1f766.webp"], at: { literals: ["stack.fc.0"] } },
  ];
  const asset = (path) => (path ? (path.startsWith("manual/") ? "/pictures/" + path : "/freight/" + path) : null);
  const at = (step) => {
    const said = staged(steps, step, fold);
    return { status: statuses(fold, steps, step), tints: tints(steps, step, fold), seats: seats(posed(fold, said)), pins: pins(steps, step, fold, step === 2 ? notes : []), step };
  };
  const opened = [];
  const props = proxy({ entries: entries(fold, { asset }), ...at(1), asset, view: "iso", onimage: (images, k) => opened.push(images[k]) });
  Stage(document.getElementById("pane"), props);
  const settled = () => new Promise((done) => setTimeout(done, 1800));
  const pane = document.getElementById("pane");
  await settled();
  const one = pane.querySelectorAll(".pin").length;
  Object.assign(props, at(2));
  flushSync();
  await settled();
  const boxes = [...pane.querySelectorAll(".pin")].map((box) => ({ tone: box.className, text: box.textContent.trim(), left: box.style.left, top: box.style.top, thumbs: box.querySelectorAll("img").length }));
  pane.querySelector(".pin-thumb")?.click();
  const two = at(2);
  window.probe = {
    placements: fold.placements.length,
    drawn: props.entries.reduce((sum, entry) => sum + entry.nodes.length, 0),
    pinsAtStep1: one,
    pins: two.pins,
    seat: { "tail.0/tail_half_b.0": [at(1).seats["tail.0/tail_half_b.0"], two.seats["tail.0/tail_half_b.0"]], "head.0/head_shell.0": [at(1).seats["head.0/head_shell.0"].parentMatrix.slice(12, 15), two.seats["head.0/head_shell.0"].parentMatrix.slice(12, 15)] },
    boxes,
    lines: pane.querySelectorAll(".pin-lines line").length,
    opened,
  };
  document.title = "probed";
</script>`;

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
