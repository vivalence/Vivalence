import { specimen } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { parseHTML } from "linkedom";
import { atom } from "nanostores";
import { Bridge } from "../../src/typology/stores/bridge/bridge.js";
import { leaves } from "../../src/typology/stores/bridge/panes.js";
import { Terminals } from "../../src/typology/stores/terminals.js";
import { BRIDGE, TERMINALS } from "../../src/client.js";

const CLIENT = import.meta.resolve("svelte/internal/client");
const ENTRY = new URL("../../index-client.js", CLIENT).href;
const SRC = new URL("../../src/", import.meta.url);
const DRAPES = new URL("../../../../subsystems/drapes/", import.meta.url);
const STORAGE_KEY = "vivalence:bridge";
const BOX = { left: 0, top: 0, right: 400, bottom: 800, width: 400, height: 800 };

const WIDGETS = {
  Rail: new URL("app/panels/c/c.svelte", SRC),
  Pane: new URL("app/panels/c/widgets/Pane.svelte", SRC),
  Strip: new URL("display/Strip.svelte", DRAPES),
  Empty: new URL("display/Empty.svelte", DRAPES),
  Spinner: new URL("display/Spinner.svelte", DRAPES),
  Key: new URL("controls/Key.svelte", DRAPES),
  Float: new URL("panels/Float.svelte", DRAPES),
};

const BODIES = { PanelD: "navigation", PanelE: "thread", PanelF: "cursor", Terminals: "terminal", Mode: "mode", Buffer: "buffer", Harness: "harness" };

const SHIM = `
export { chain } from "${new URL("typology/gestalten/belt/chain.js", SRC).href}";
import * as panes from "${new URL("typology/stores/bridge/panes.js", SRC).href}";
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
  [/from "\.\/(?:panes|widgets)\/([A-Za-z]+)\.svelte"/g, 'from "./$1.js"'],
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
  for (const [name, word] of Object.entries(BODIES)) await Deno.writeTextFile(`${dir}/${name}.js`, built(`<span class="stub">${word}</span>`, name));
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

const thread = (traits, buffers = []) => ({
  id: "t1",
  $mode: atom(mode(traits)),
  $buffers: atom(buffers),
  $phase: atom("inert"),
  trait: {},
  daemon: { entities: { buffer: { drop() {}, removeOne: () => Promise.resolve() } } },
});

specimen.describe("rail C — mounted: one tree, four folds, a strip", () => {
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
  const labels = () => classed("pane-label").map((label) => label.textContent);
  const keyed = (title) => [...document.body.getElementsByTagName("button")].filter((button) => button.getAttribute("title") === title);
  const stored = () => JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY)).panes;

  const rail = (saved, seat, walk) => {
    if (saved) globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ panes: saved }));
    else globalThis.localStorage.removeItem(STORAGE_KEY);
    const bridge = new Bridge();
    const terminals = new Terminals();
    seat(terminals);
    const app = mount(Rail, { target: document.body, props: { rect: BOX }, context: new Map([[BRIDGE, bridge], [TERMINALS, terminals]]) });
    flush();
    try {
      walk({ bridge, terminals });
    } finally {
      unmount(app);
      flush();
    }
  };

  const two = { type: "split", dir: "v", ratio: 0.5, a: { type: "leaf", pane: "terminal" }, b: { type: "leaf", pane: "navigation" } };

  specimen.it("page draws one pane whole; the strip holds a key per available pane; a tap shows, the fold key walks", () => {
    rail(null, (terminals) => terminals.create(), ({ bridge }) => {
      specimen.expect([labels(), bodies()]).toEqual([["terminals"], ["terminal"]]);
      specimen.expect(["terminals", "navigation", "thread", "mode", "buffer", "harness"].map((title) => keyed(title).length)).toEqual([1, 1, 0, 0, 0, 0]);
      specimen.expect(document.body.getElementsByClassName("panel")[0].getAttribute("data-zone")).toBe("0");

      fire(keyed("navigation")[0], "click");
      flush();
      specimen.expect([labels(), bodies(), bridge.panes.expanded, stored().expanded]).toEqual([["navigation"], ["navigation"], "navigation", "navigation"]);
      specimen.expect(leaves(bridge.panes.tree)).toEqual(["terminal", "navigation"]);

      const walked = [];
      for (let turn = 0; turn < 4; turn += 1) {
        fire(keyed(`fold · ${bridge.panes.fold} · click to cycle · hold for all`)[0], "click");
        flush();
        walked.push([bridge.panes.fold, stored().fold, labels().length, bodies().length, classed("handle").length, classed("seam").length]);
      }
      specimen.expect(walked).toEqual([
        ["stack", "stack", 2, 2, 2, 0],
        ["accordion", "accordion", 2, 1, 0, 0],
        ["free", "free", 2, 2, 0, 1],
        ["page", "page", 1, 1, 0, 0],
      ]);
    });
  });

  specimen.it("stack: a second tap parks the pane, a tap on a parked pane opens it; the last pane parked leaves the empty line", () => {
    rail({ tree: two, fold: "stack", expanded: "terminal", heights: { terminal: 240 } }, (terminals) => terminals.create(), ({ bridge }) => {
      specimen.expect(labels()).toEqual(["terminals", "navigation"]);
      specimen.expect(classed("leaf").map((leaf) => leaf.style.height)).toEqual(["240px", "auto"]);

      fire(keyed("navigation")[0], "click");
      flush();
      specimen.expect([labels(), leaves(stored().tree)]).toEqual([["terminals"], ["terminal"]]);

      fire(keyed("park")[0], "click");
      flush();
      specimen.expect([labels(), bridge.panes.tree, stored().tree]).toEqual([[], null, null]);
      specimen.expect(document.body.textContent).toContain("every pane is parked");

      fire(keyed("navigation")[0], "click");
      flush();
      specimen.expect([labels(), bridge.panes.expanded]).toEqual([["navigation"], "navigation"]);
    });
  });

  specimen.it("accordion: every head, one body; a tap on a head opens it, a tap on its keys does not", () => {
    rail({ tree: two, fold: "accordion", expanded: "terminal", heights: {} }, (terminals) => terminals.create(), ({ bridge }) => {
      specimen.expect([labels(), bodies()]).toEqual([["terminals", "navigation"], ["terminal"]]);
      specimen.expect(classed("leaf").map((leaf) => [leaf.style.top, leaf.style.height])).toEqual([
        ["calc(var(--pane-step) * 0)", "calc(100% - var(--pane-step) * 1)"],
        ["calc(100% - var(--pane-step) * 1)", "var(--pane-step)"],
      ]);

      const head = classed("pane-head")[1];
      fire(head, "click", { target: keyed("solo")[1] });
      flush();
      specimen.expect(bridge.panes.expanded).toBe("terminal");

      fire(head, "click");
      flush();
      specimen.expect([bodies(), bridge.panes.expanded, stored().expanded]).toEqual([["navigation"], "navigation", "navigation"]);
    });
  });

  specimen.it("free: a seam drags the ratio inside its bounds, a head dropped on a pane's edge moves the pane, on its core swaps", () => {
    rail({ tree: two, fold: "free", expanded: "terminal", heights: {} }, (terminals) => terminals.create(), ({ bridge }) => {
      const panel = document.body.getElementsByClassName("panel")[0];

      fire(classed("seam")[0], "pointerdown", { clientX: 200, clientY: 400 });
      fire(panel, "pointermove", { clientX: 200, clientY: 240 });
      flush();
      specimen.expect(classed("leaf").map((leaf) => leaf.style.height)).toEqual(["30%", "70%"]);
      specimen.expect(bridge.panes.tree.ratio).toBe(0.5);
      fire(panel, "pointermove", { clientX: 200, clientY: 790 });
      fire(panel, "pointerup");
      flush();
      specimen.expect([bridge.panes.tree.ratio, stored().tree.ratio]).toEqual([0.85, 0.85]);

      fire(classed("pane-head")[1], "pointerdown", { clientX: 200, clientY: 700 });
      fire(panel, "pointermove", { clientX: 20, clientY: 300 });
      flush();
      specimen.expect(classed("rider")[0].textContent.replace(/\s+/g, " ").trim()).toBe("navigation left of terminal");
      specimen.expect(classed("landing").map((landing) => [landing.style.left, landing.style.width, landing.style.height])).toEqual([["0%", "50%", "85%"]]);
      fire(panel, "pointerup");
      flush();
      specimen.expect([bridge.panes.tree.dir, leaves(bridge.panes.tree), leaves(stored().tree)]).toEqual(["h", ["navigation", "terminal"], ["navigation", "terminal"]]);
      specimen.expect([classed("rider").length, classed("landing").length]).toEqual([0, 0]);

      fire(classed("pane-head")[0], "pointerdown", { clientX: 100, clientY: 10 });
      fire(panel, "pointermove", { clientX: 300, clientY: 400 });
      flush();
      specimen.expect(classed("rider")[0].textContent.replace(/\s+/g, " ").trim()).toBe("navigation swap with terminal");
      fire(panel, "pointerup");
      flush();
      specimen.expect(leaves(bridge.panes.tree)).toEqual(["terminal", "navigation"]);

      fire(classed("pane-head")[0], "pointerdown", { clientX: 100, clientY: 10 });
      fire(panel, "pointermove", { clientX: 100, clientY: 12 });
      fire(panel, "pointerup");
      flush();
      specimen.expect(leaves(bridge.panes.tree)).toEqual(["terminal", "navigation"]);
    });
  });

  specimen.it("stack: the handle under a pane writes its height, never under the floor", () => {
    rail({ tree: two, fold: "stack", expanded: "terminal", heights: {} }, (terminals) => terminals.create(), ({ bridge }) => {
      const panel = document.body.getElementsByClassName("panel")[0];

      fire(classed("handle")[1], "pointerdown", { clientX: 200, clientY: 300 });
      fire(panel, "pointermove", { clientX: 200, clientY: 330 });
      flush();
      specimen.expect(classed("leaf").map((leaf) => leaf.style.height)).toEqual(["auto", "330px"]);
      specimen.expect(bridge.panes.heights).toEqual({});
      fire(panel, "pointermove", { clientX: 200, clientY: 12 });
      fire(panel, "pointerup");
      flush();
      specimen.expect([bridge.panes.heights, stored().heights]).toEqual([{ navigation: 60 }, { navigation: 60 }]);
    });
  });

  specimen.it("solo keeps the tree it left and a second tap gives it back; the tree a solo left is never saved", () => {
    rail({ tree: two, fold: "free", expanded: "terminal", heights: {} }, (terminals) => terminals.create(), ({ bridge }) => {
      fire(keyed("solo")[1], "click");
      flush();
      specimen.expect([labels(), bridge.panes.tree, leaves(bridge.panes.previous), Object.keys(stored()).sort()]).toEqual([
        ["navigation"],
        { type: "leaf", pane: "navigation" },
        ["terminal", "navigation"],
        ["expanded", "fold", "heights", "tree"],
      ]);
      fire(keyed("give the tree back")[0], "click");
      flush();
      specimen.expect([labels(), bridge.panes.previous]).toEqual([["terminals", "navigation"], null]);
    });
  });

  specimen.it("the panes a terminal cannot show are pruned once it has settled, and held while it settles", () => {
    const tree = { type: "split", dir: "h", ratio: 0.5, a: two, b: { type: "split", dir: "v", ratio: 0.5, a: { type: "leaf", pane: "thread" }, b: { type: "leaf", pane: "harness" } } };
    rail({ tree, fold: "free", expanded: "thread", heights: {} }, (terminals) => terminals.create().$settling.set({ thread: "t1", buffer: null }), ({ bridge, terminals }) => {
      specimen.expect(labels()).toEqual(["terminals", "navigation", "thread", "harness"]);
      specimen.expect(bodies()).toEqual(["terminal", "navigation", "thread", "harness"]);

      terminals.active.thread = thread(["HARNESSED"]);
      terminals.active.$settling.set(null);
      flush();
      specimen.expect([labels(), leaves(bridge.panes.tree)]).toEqual([["terminals", "navigation", "thread", "harness"], ["terminal", "navigation", "thread", "harness"]]);
      specimen.expect(["thread", "mode", "buffer", "harness"].map((title) => keyed(title).length)).toEqual([1, 1, 0, 1]);

      terminals.active.$thread.get().$mode.set(mode(["APPLICATION"]));
      flush();
      specimen.expect([labels(), leaves(stored().tree)]).toEqual([["terminals", "navigation", "thread"], ["terminal", "navigation", "thread"]]);
      specimen.expect(["thread", "mode", "buffer", "harness"].map((title) => keyed(title).length)).toEqual([1, 1, 1, 0]);

      terminals.active.thread = null;
      flush();
      specimen.expect([labels(), leaves(stored().tree)]).toEqual([["terminals", "navigation"], ["terminal", "navigation"]]);
    });
  });

  specimen.it("the thread pane: the traits in the rail's chrome, the cursor in a body box the rail opens", () => {
    rail({ tree: { type: "leaf", pane: "thread" }, fold: "page", expanded: "thread", heights: {} }, (terminals) => {
      terminals.create().thread = thread(["APPLICATION"]);
    }, () => {
      specimen.expect(bodies()).toEqual(["thread", "cursor"]);
      const [traits, cursor] = classed("stub");
      specimen.expect([traits.parentNode.getAttribute("data-zone"), cursor.parentNode.getAttribute("data-zone")]).toEqual([null, "1"]);
    });
  });

  specimen.it("nothing loops and nothing faults", () => {
    specimen.expect(dumps).toEqual([]);
  });
});
