import { specimen, Status } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { parseHTML } from "linkedom";
import { atom } from "nanostores";
import { Bridge } from "../../src/bridge/prototype.js";
import { leaves } from "../../src/bridge/panes.js";
import { Terminals } from "../../src/entities/terminal/terminals.js";
import { repositoryDouble } from "./rig.js";
import { BRIDGE, TERMINALS } from "../../src/client.js";

const CLIENT = import.meta.resolve("svelte/internal/client");
const ENTRY = new URL("../../index-client.js", CLIENT).href;
const SRC = new URL("../../src/", import.meta.url);
const DRAPES = new URL("../../../../subsystems/drapes/", import.meta.url);
const STORAGE_KEY = "vivalence:bridge";
const BOX = { left: 0, top: 0, right: 400, bottom: 800, width: 400, height: 800 };

const WIDGETS = {
  Rail: new URL("app/panels/c/c.svelte", SRC),
  Card: new URL("app/panels/c/cards/Card.svelte", SRC),
  Strip: new URL("display/Strip.svelte", DRAPES),
  Empty: new URL("display/Empty.svelte", DRAPES),
  Spinner: new URL("display/Spinner.svelte", DRAPES),
  Key: new URL("controls/Key.svelte", DRAPES),
  Float: new URL("panels/Float.svelte", DRAPES),
};

const BODIES = { Terminals: ["terminals", "terminal"], Threads: ["threads", "threads"], Modes: ["modes", "modes"], Thread: ["thread", "thread"], Mode: ["mode", "mode"], Buffers: ["buffers", "buffers"], Buffer: ["buffer", "buffer"], Harness: ["harness", "harness"] };

const SHIM = `
export { chain } from "${new URL("gestalten/belt/chain.js", SRC).href}";
import * as panes from "${new URL("bridge/panes.js", SRC).href}";
export const stores = { bridge: { panes } };
`;

const parts = (whole, names) => names.split(",").map((name) => `import ${name.trim()} from "./${name.trim()}.js";`).join("\n");

const REWRITES = [
  [/^import ['"]svelte\/internal\/(disclose-version|flags\/[a-z]+)['"];\n?/gm, ""],
  [/from ['"]svelte\/internal\/client['"]/g, `from "${CLIENT}"`],
  [/from "svelte"/g, `from "${ENTRY}"`],
  [/import \{ ([^}]+) \} from "@vivalence\/drapes";?/g, parts],
  [/from "@vivalence\/anima"/g, 'from "./anima.js"'],
  [/from "\$client"/g, `from "${new URL("client.js", SRC).href}"`],
  [/from "\.\.\/([def])\/\1\.svelte"/g, (whole, letter) => `from "./Panel${letter.toUpperCase()}.js"`],
  [/from "\.\/(?:panes|widgets|cards)\/([A-Za-z]+)\.svelte"/g, 'from "./$1.js"'],
  [/from "\.\.\/(?:controls|panels)\/([A-Za-z]+)\.svelte"/g, 'from "./$1.js"'],
  [/from "\.\/([A-Za-z]+)\.svelte"/g, 'from "./$1.js"'],
  [/from "\.\/strip\.js"/, `from "${new URL("display/strip.js", DRAPES).href}"`],
  [/from "\.\/float\.js"/, `from "${new URL("panels/float.js", DRAPES).href}"`],
];

const built = (source, name) => {
  let code = compile(source, { generate: "client", filename: `${name}.svelte`, css: "external", dev: true }).js.code;
  for (const [from, to] of REWRITES) code = code.replace(from, to);
  return code;
};

async function build(dir) {
  for (const [name, url] of Object.entries(WIDGETS)) await Deno.writeTextFile(`${dir}/${name}.js`, built(await Deno.readTextFile(url), name));
  for (const [name, [label, word]] of Object.entries(BODIES)) await Deno.writeTextFile(`${dir}/${name}.js`, built(`<script>import Card from "./Card.svelte"; let { ...chrome } = $props();</script><Card label="${label}" {...chrome}><span class="stub">${word}</span></Card>`, name));
  await Deno.writeTextFile(`${dir}/anima.js`, SHIM);
  return `${dir}/Rail.js`;
}

function dom() {
  const { window, document } = parseHTML("<!doctype html><html><head></head><body></body></html>");
  const walk = (node, key) => {
    for (let proto = Object.getPrototypeOf(node); proto && proto !== window.Node.prototype; proto = Object.getPrototypeOf(proto)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc?.get) return desc.get.call(node);
    }
    return null;
  };
  for (const key of ["firstChild", "nextSibling"]) {
    const own = Object.getOwnPropertyDescriptor(window.Node.prototype, key);
    Object.defineProperty(window.Node.prototype, key, { configurable: true, get() { return walk(this, key) ?? own?.get?.call(this) ?? null; } });
  }
  Object.defineProperty(window.HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 600 });
  Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 40 });
  window.HTMLElement.prototype.getBoundingClientRect = () => BOX;
  window.HTMLElement.prototype.setPointerCapture = () => {};
  Object.assign(globalThis, {
    window, document,
    Node: window.Node, Element: window.Element, HTMLElement: window.HTMLElement, Text: window.Text, Comment: window.Comment,
    DocumentFragment: window.DocumentFragment, Event: window.Event, CustomEvent: window.CustomEvent,
    HTMLMediaElement: window.HTMLMediaElement ?? class {},
    MutationObserver: window.MutationObserver ?? class { observe() {} disconnect() {} },
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    requestAnimationFrame: (fn) => setTimeout(fn, 16),
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
  });
  return document;
}

const fire = (element, type, detail = {}) => {
  const handler = element[`__${type}`];
  const event = { type, target: element, currentTarget: element, pointerId: 1, clientX: 0, clientY: 0, preventDefault() {}, stopPropagation() {}, ...detail };
  return Array.isArray(handler) ? handler[0].call(element, event, ...handler.slice(1)) : handler.call(element, event);
};

const mode = (traits) => ({ id: "m1", slug: "mode", traits, implements: (trait) => traits.includes(trait.toUpperCase()) });

const daemon = {
  id: "daemon-rail",
  slug: "rail",
  status: new Status("healthy"),
  entities: {
    buffer: { drop() {}, removeOne: () => Promise.resolve() },
    thread: { $entities: atom([]), findOneLocal: ({ id }) => daemon.entities.thread.$entities.get().find((held) => held.id === id) ?? null },
  },
};

const thread = (traits, buffers = []) => {
  const held = { id: "t1", $mode: atom(mode(traits)), $buffers: atom(buffers), $phase: atom("inert"), trait: {}, daemon };
  daemon.entities.thread.$entities.set([held]);
  return held;
};

specimen.describe("rail C — mounted: one tree, four folds, a strip, the cards as bodies", () => {
  let dir, document, mount, unmount, flush, Rail, held;
  const dumps = [];
  const quiet = console.error;

  specimen.beforeAll(async () => {
    held = globalThis.localStorage.getItem(STORAGE_KEY);
    dir = await Deno.makeTempDir({ prefix: "anima-rail-mount-" });
    document = dom();
    ({ mount, unmount } = await import(ENTRY));
    ({ flush } = await import(CLIENT));
    ({ default: Rail } = await import(`file://${await build(dir)}`));
    console.error = (...args) => dumps.push(String(args[0]?.name ?? args[0]));
  });
  specimen.afterAll(async () => {
    console.error = quiet;
    if (held === null) globalThis.localStorage.removeItem(STORAGE_KEY);
    else globalThis.localStorage.setItem(STORAGE_KEY, held);
    await Deno.remove(dir, { recursive: true });
  });

  const classed = (name) => [...document.body.getElementsByClassName(name)];
  const bodies = () => classed("stub").map((stub) => stub.textContent);
  const labels = () => classed("card-label").map((label) => label.textContent);
  const keyed = (title) => [...document.body.getElementsByTagName("button")].filter((button) => button.getAttribute("title") === title);
  const stored = () => JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY)).panels.c;

  const rail = async (saved, seat, walk) => {
    if (saved) globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ panels: { c: saved } }));
    else globalThis.localStorage.removeItem(STORAGE_KEY);
    const bridge = new Bridge();
    const terminals = new Terminals(repositoryDouble([daemon]));
    await seat(terminals);
    const app = mount(Rail, { target: document.body, props: { rect: BOX }, context: new Map([[BRIDGE, bridge], [TERMINALS, terminals]]) });
    flush();
    try {
      await walk({ bridge, terminals });
    } finally {
      unmount(app);
      flush();
    }
  };

  const two = { type: "split", dir: "v", ratio: 0.5, a: { type: "leaf", pane: "terminal" }, b: { type: "leaf", pane: "threads" } };

  specimen.it("page draws one pane whole — a fresh rail opens on threads; the strip holds a key per available pane; a tap opens, the fold key walks", async () => {
    await rail(null, (terminals) => terminals.create(), ({ bridge }) => {
      specimen.expect([labels(), bodies()]).toEqual([["threads"], ["threads"]]);
      specimen.expect(["terminals", "threads", "modes", "thread", "mode", "buffers", "buffer", "harness"].map((title) => keyed(title).length)).toEqual([1, 1, 1, 0, 0, 0, 0, 0]);
      specimen.expect(document.body.getElementsByClassName("panel")[0].getAttribute("data-zone")).toBe("0");

      fire(keyed("terminals")[0], "click");
      flush();
      specimen.expect([labels(), bodies(), bridge.panels.c.expanded, stored().expanded]).toEqual([["terminals"], ["terminal"], "terminal", "terminal"]);
      specimen.expect(leaves(bridge.panels.c.tree)).toEqual(["terminal", "threads"]);

      const walked = [];
      for (let turn = 0; turn < 4; turn += 1) {
        fire(keyed(`fold · ${bridge.panels.c.fold} · click to cycle · hold for all`)[0], "click");
        flush();
        walked.push([bridge.panels.c.fold, stored().fold, labels().length, bodies().length, classed("handle").length, classed("seam").length]);
      }
      specimen.expect(walked).toEqual([
        ["stack", "stack", 2, 2, 2, 0],
        ["accordion", "accordion", 2, 1, 0, 0],
        ["free", "free", 2, 2, 0, 1],
        ["page", "page", 1, 1, 0, 0],
      ]);
    });
  });

  specimen.it("stack: a second tap parks the pane, a tap on a parked pane opens it; the last pane parked leaves the empty line", async () => {
    await rail({ tree: two, fold: "stack", expanded: "terminal", heights: { terminal: 240 } }, (terminals) => terminals.create(), ({ bridge }) => {
      specimen.expect(labels()).toEqual(["terminals", "threads"]);
      specimen.expect(classed("leaf").map((leaf) => leaf.style.height)).toEqual(["240px", "auto"]);

      fire(keyed("threads")[0], "click");
      flush();
      specimen.expect([labels(), leaves(stored().tree)]).toEqual([["terminals"], ["terminal"]]);

      fire(keyed("park")[0], "click");
      flush();
      specimen.expect([labels(), bridge.panels.c.tree, stored().tree]).toEqual([[], null, null]);
      specimen.expect(document.body.textContent).toContain("every pane is parked");

      fire(keyed("threads")[0], "click");
      flush();
      specimen.expect([labels(), bridge.panels.c.expanded]).toEqual([["threads"], "threads"]);
    });
  });

  specimen.it("accordion: every head, one body — a seated terminal opens threads; a tap on a head opens it, a tap on its keys does not", async () => {
    await rail({ tree: two, fold: "accordion", expanded: "terminal", heights: {} }, (terminals) => terminals.create(), ({ bridge }) => {
      specimen.expect([labels(), bodies(), bridge.panels.c.expanded]).toEqual([["terminals", "threads"], ["threads"], "threads"]);
      specimen.expect(classed("leaf").map((leaf) => [leaf.style.top, leaf.style.height])).toEqual([
        ["calc(var(--pane-step) * 0)", "var(--pane-step)"],
        ["calc(var(--pane-step) * 1)", "calc(100% - var(--pane-step) * 1)"],
      ]);

      const head = classed("card-head")[0];
      fire(head, "click", { target: keyed("solo")[0] });
      flush();
      specimen.expect(bridge.panels.c.expanded).toBe("threads");

      fire(head, "click");
      flush();
      specimen.expect([bodies(), bridge.panels.c.expanded, stored().expanded]).toEqual([["terminal"], "terminal", "terminal"]);
    });
  });

  specimen.it("a terminal seated after mount opens threads along the rail's grain, parked or not", async () => {
    await rail({ tree: { type: "leaf", pane: "terminal" }, fold: "free", expanded: "terminal", heights: {} }, () => {}, async ({ bridge, terminals }) => {
      specimen.expect(leaves(bridge.panels.c.tree)).toEqual(["terminal"]);
      await terminals.create();
      flush();
      specimen.expect([bridge.panels.c.tree.dir, leaves(bridge.panels.c.tree), bridge.panels.c.expanded]).toEqual(["v", ["terminal", "threads"], "threads"]);
    });
  });

  specimen.it("free: a seam drags the ratio inside its bounds, a head dropped on a pane's edge moves the pane, on its core swaps", async () => {
    await rail({ tree: two, fold: "free", expanded: "terminal", heights: {} }, (terminals) => terminals.create(), ({ bridge }) => {
      const panel = document.body.getElementsByClassName("panel")[0];

      fire(classed("seam")[0], "pointerdown", { clientX: 200, clientY: 400 });
      fire(panel, "pointermove", { clientX: 200, clientY: 240 });
      flush();
      specimen.expect(classed("leaf").map((leaf) => leaf.style.height)).toEqual(["30%", "70%"]);
      specimen.expect(bridge.panels.c.tree.ratio).toBe(0.5);
      fire(panel, "pointermove", { clientX: 200, clientY: 790 });
      fire(panel, "pointerup");
      flush();
      specimen.expect([bridge.panels.c.tree.ratio, stored().tree.ratio]).toEqual([0.85, 0.85]);

      fire(classed("card-head")[1], "pointerdown", { clientX: 200, clientY: 700 });
      fire(panel, "pointermove", { clientX: 20, clientY: 300 });
      flush();
      specimen.expect(classed("rider")[0].textContent.replace(/\s+/g, " ").trim()).toBe("threads left of terminal");
      specimen.expect(classed("landing").map((landing) => [landing.style.left, landing.style.width, landing.style.height])).toEqual([["0%", "50%", "85%"]]);
      fire(panel, "pointerup");
      flush();
      specimen.expect([bridge.panels.c.tree.dir, leaves(bridge.panels.c.tree), leaves(stored().tree)]).toEqual(["h", ["threads", "terminal"], ["threads", "terminal"]]);
      specimen.expect([classed("rider").length, classed("landing").length]).toEqual([0, 0]);

      fire(classed("card-head")[0], "pointerdown", { clientX: 100, clientY: 10 });
      fire(panel, "pointermove", { clientX: 300, clientY: 400 });
      flush();
      specimen.expect(classed("rider")[0].textContent.replace(/\s+/g, " ").trim()).toBe("threads swap with terminal");
      fire(panel, "pointerup");
      flush();
      specimen.expect(leaves(bridge.panels.c.tree)).toEqual(["terminal", "threads"]);

      fire(classed("card-head")[0], "pointerdown", { clientX: 100, clientY: 10 });
      fire(panel, "pointermove", { clientX: 100, clientY: 12 });
      fire(panel, "pointerup");
      flush();
      specimen.expect(leaves(bridge.panels.c.tree)).toEqual(["terminal", "threads"]);
    });
  });

  specimen.it("stack: the handle under a pane writes its height, never under the floor", async () => {
    await rail({ tree: two, fold: "stack", expanded: "terminal", heights: {} }, (terminals) => terminals.create(), ({ bridge }) => {
      const panel = document.body.getElementsByClassName("panel")[0];

      fire(classed("handle")[1], "pointerdown", { clientX: 200, clientY: 300 });
      fire(panel, "pointermove", { clientX: 200, clientY: 330 });
      flush();
      specimen.expect(classed("leaf").map((leaf) => leaf.style.height)).toEqual(["auto", "330px"]);
      specimen.expect(bridge.panels.c.heights).toEqual({});
      fire(panel, "pointermove", { clientX: 200, clientY: 12 });
      fire(panel, "pointerup");
      flush();
      specimen.expect([bridge.panels.c.heights, stored().heights]).toEqual([{ threads: 60 }, { threads: 60 }]);
    });
  });

  specimen.it("solo keeps the tree it left and a second tap gives it back; the tree a solo left is never saved", async () => {
    await rail({ tree: two, fold: "free", expanded: "terminal", heights: {} }, (terminals) => terminals.create(), ({ bridge }) => {
      fire(keyed("solo")[1], "click");
      flush();
      specimen.expect([labels(), bridge.panels.c.tree, leaves(bridge.panels.c.previous), Object.keys(stored()).sort()]).toEqual([
        ["threads"],
        { type: "leaf", pane: "threads" },
        ["terminal", "threads"],
        ["expanded", "fold", "heights", "tree"],
      ]);
      fire(keyed("give the tree back")[0], "click");
      flush();
      specimen.expect([labels(), bridge.panels.c.previous]).toEqual([["terminals", "threads"], null]);
    });
  });

  specimen.it("the panes a terminal cannot show are masked from the draw and the strip once it has settled, held while it settles; the saved tree keeps them", async () => {
    const tree = { type: "split", dir: "h", ratio: 0.5, a: two, b: { type: "split", dir: "v", ratio: 0.5, a: { type: "leaf", pane: "thread" }, b: { type: "leaf", pane: "harness" } } };
    await rail({ tree, fold: "free", expanded: "thread", heights: {} }, async (terminals) => (await terminals.create()).$settling.set({ thread: "t1" }), async ({ bridge, terminals }) => {
      specimen.expect(labels()).toEqual(["terminals", "threads", "thread", "harness"]);
      specimen.expect(bodies()).toEqual(["terminal", "threads", "thread", "harness"]);

      await terminals.active.seat(thread(["HARNESSED"]));
      terminals.active.$settling.set(null);
      flush();
      specimen.expect([labels(), leaves(bridge.panels.c.tree)]).toEqual([["terminals", "threads", "thread", "harness"], ["terminal", "threads", "thread", "harness"]]);
      specimen.expect(["thread", "mode", "buffers", "buffer", "harness"].map((title) => keyed(title).length)).toEqual([1, 1, 0, 0, 1]);

      terminals.active.$thread.get().$mode.set(mode(["APPLICATION"]));
      flush();
      specimen.expect([labels(), leaves(stored().tree)]).toEqual([["terminals", "threads", "thread"], ["terminal", "threads", "thread", "harness"]]);
      specimen.expect(["thread", "mode", "buffers", "buffer", "harness"].map((title) => keyed(title).length)).toEqual([1, 1, 1, 1, 0]);

      await terminals.active.seat(null);
      flush();
      specimen.expect([labels(), leaves(stored().tree)]).toEqual([["terminals", "threads"], ["terminal", "threads", "thread", "harness"]]);

      await terminals.active.seat(thread(["HARNESSED"]));
      flush();
      specimen.expect(labels()).toEqual(["terminals", "threads", "thread", "harness"]);
    });
  });

  specimen.it("nothing loops and nothing faults", () => {
    specimen.expect(dumps).toEqual([]);
  });
});
