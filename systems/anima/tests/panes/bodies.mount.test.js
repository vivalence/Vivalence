import { specimen, Status } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { parseHTML } from "linkedom";
import { atom } from "nanostores";
import { Terminals } from "../../src/typology/stores/terminals.js";
import { Thread } from "../../src/typology/entities/thread/thread.js";
import { Mode } from "../../src/typology/entities/mode/mode.js";
import { Buffer } from "../../src/typology/entities/buffer.js";
import { LIGHTHOUSE, TERMINALS } from "../../src/client.js";

const CLIENT = import.meta.resolve("svelte/internal/client");
const ENTRY = new URL("../../index-client.js", CLIENT).href;
const SRC = new URL("../../src/", import.meta.url);
const DRAPES = new URL("../../../../subsystems/drapes/", import.meta.url);

const PANELS = [
  "app/panels/d/d",
  "app/panels/d/ThreadLabel",
  "app/panels/e/e",
  "app/panels/e/widgets/Labeled",
  "app/panels/e/widgets/Masked",
  "app/panels/e/widgets/Aimed",
  "app/panels/e/widgets/Queueing",
  "app/panels/e/widgets/form/FormFromSchema",
  "app/panels/e/widgets/form/EntityField",
  "app/panels/e/widgets/form/EntitySetField",
  "app/panels/e/widgets/form/EntityRow",
  "app/panels/e/widgets/form/SymbolFacets",
  "app/panels/f/f",
  "app/panels/f/widgets/ActivitySection",
  "app/panels/f/widgets/ActivityRow",
  "app/panels/c/panes/Terminals",
  "app/panels/c/panes/Mode",
  "app/panels/c/panes/Buffer",
  "app/panels/c/panes/Harness",
  "app/widgets/Tune",
];
const KIT = [
  "controls/Key",
  "controls/Input",
  "controls/Segmented",
  "controls/Stepper",
  "display/Row",
  "display/Reading",
  "display/Well",
  "display/ToolRow",
  "display/Pressed",
  "display/Spinner",
  "display/Status",
  "display/Tag",
  "display/Empty",
  "display/Chip",
  "display/Section",
  "panels/Card",
];

const SHIM = `
export { chain } from "${new URL("typology/gestalten/belt/chain.js", SRC).href}";
export { TONES, loudest, owed, roster, settled } from "${new URL("typology/entities/activity.js", SRC).href}";
export * as ThreadTraits from "${new URL("typology/entities/thread/traits/index.js", SRC).href}";
export * as ModeTraits from "${new URL("typology/entities/mode/traits/index.js", SRC).href}";
`;

const parts = (whole, names) => names.split(",").map((name) => `import ${name.trim()} from "./${name.trim()}.js";`).join("\n");

const rewrites = (url) => [
  [/^import ['"]svelte\/internal\/(disclose-version|flags\/[a-z]+)['"];\n?/gm, ""],
  [/from ['"]svelte\/internal\/client['"]/g, `from "${CLIENT}"`],
  [/from "svelte"/g, `from "${ENTRY}"`],
  [/import \{ ([^}]+) \} from "@vivalence\/drapes";?/g, parts],
  [/from "@vivalence\/anima"/g, 'from "./anima.js"'],
  [/from "\$client"/g, `from "${new URL("client.js", SRC).href}"`],
  [/from "\.{1,2}\/(?:[A-Za-z.]+\/)*([A-Za-z]+)\.svelte"/g, 'from "./$1.js"'],
  [/from "(\.{1,2}\/[^"]+\.js)"/g, (whole, path) => (/^\.\/(?:[A-Z][A-Za-z]*|anima)\.js$/.test(path) ? whole : `from "${new URL(path, url).href}"`)],
];

async function build(dir) {
  const sources = [...PANELS.map((path) => new URL(`${path}.svelte`, SRC)), ...KIT.map((path) => new URL(`${path}.svelte`, DRAPES))];
  for (const url of sources) {
    const name = url.pathname.split("/").pop().replace(".svelte", "");
    let code = compile(await Deno.readTextFile(url), { generate: "client", filename: `${name}.svelte`, css: "external", dev: true }).js.code;
    for (const [from, to] of rewrites(url)) code = code.replace(from, to);
    await Deno.writeTextFile(`${dir}/${name}.js`, code);
  }
  await Deno.writeTextFile(`${dir}/anima.js`, SHIM);
  return Object.fromEntries(await Promise.all(["d", "e", "f", "Terminals", "Mode", "Buffer", "Harness"].map(async (name) => [name, (await import(`file://${dir}/${name}.js`)).default])));
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
  const chosen = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value");
  Object.defineProperty(window.HTMLSelectElement.prototype, "value", {
    configurable: true,
    get() { return this.picked ?? chosen.get.call(this); },
    set(next) { this.picked = next; },
  });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLElement.prototype.focus = function () { this.focused = true; };
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
  if (!handler) return element.dispatchEvent(Object.assign(new globalThis.window.Event(type, { bubbles: true }), detail));
  const event = { type, target: element, currentTarget: element, button: 0, preventDefault() {}, stopPropagation() {}, ...detail };
  return Array.isArray(handler) ? handler[0].call(element, event, ...handler.slice(1)) : handler.call(element, event);
};

const settle = async () => {
  for (let turn = 0; turn < 6; turn += 1) await new Promise((resolve) => setTimeout(resolve, 0));
};

const repository = (rows, verbs = {}) => {
  const $entities = atom(rows);
  const calls = [];
  const answer = (name, result) => (...args) => {
    calls.push([name, ...args]);
    return Promise.resolve(typeof result === "function" ? result(...args) : result);
  };
  return {
    $entities,
    calls,
    said: (name) => calls.filter(([verb]) => verb === name).map(([, ...args]) => args),
    find: answer("find", () => $entities.get()),
    updateOne: answer("updateOne", null),
    removeOne: answer("removeOne", null),
    remove: answer("remove", null),
    drop: (id) => void calls.push(["drop", id]),
    resolve: (entity) => void calls.push(["resolve", entity.id]),
    ...Object.fromEntries(Object.entries(verbs).map(([name, result]) => [name, answer(name, result)])),
  };
};

const mode = (daemon, fields) => Object.assign(new Mode(), { daemon, metadata: {}, ...fields, status: new Status("healthy") });

const buffer = (owner, fields) => {
  const { trait, data, ...rest } = fields;
  const held = Object.assign(new Buffer(), { thread: owner, mode: owner.mode, literals: [], symbols: [], ...rest });
  held.trait = trait ?? {};
  held.data = data ?? {};
  return held;
};

const thread = (daemon, fields) => {
  const { traits = ["LABELED"], trait = {}, label, buffers = [], turns = [], held, ...rest } = fields;
  const minted = Object.assign(new Thread(), { daemon, ...rest });
  minted.mode = held;
  minted.traits = traits;
  minted.trait = trait;
  minted.label = { name: label, description: null, flags: [] };
  minted.$buffers = atom(buffers.map((each) => buffer(minted, each)));
  minted.$turns = atom(turns);
  return minted;
};

const world = () => {
  const daemon = { slug: "alpha", status: new Status("healthy"), cortex: { find: () => [] }, entities: {} };
  const pending = { slug: "beta", status: new Status("mounting"), entities: {} };
  const reader = mode(daemon, {
    id: "m-reader",
    slug: "reader",
    name: "Reader",
    type: "office",
    traits: ["APPLICATION", "STANDALONE", "EMITTER", "EXPOSED"],
    metadata: {
      emitter: { branches: { due: { branches: {}, effect: { input: { type: "object", properties: { limit: { type: "integer" } } } } }, fresh: { branches: {}, effect: {} } } },
      aperture: { branches: { look: { branches: {}, effect: {} }, take: { branches: { twice: { branches: {}, effect: {} } }, effect: {} } } },
    },
  });
  reader.application = { url: "attach/bundle/alpha/reader/", schema: null, view: { kind: "svelte", hash: null, mount: { nature: "/Reader.svelte" }, bundle: { url: "attach/bundle/alpha/reader/", entry: () => ({ integrity: "9f2c4d1e8a7b6c5d" }) } } };
  const talker = mode(daemon, { id: "m-talker", slug: "talker", name: "Talker", type: "chat", traits: ["CONVERSATIONAL", "HARNESSED"], metadata: { harness: { branches: { dialogue: { branches: {} }, object: { branches: {} } } } } });
  const hidden = mode(daemon, { id: "m-hidden", slug: "hidden", type: "tool", traits: [] });
  const turns = [
    { id: "u1", role: "user", createdAt: "2026-09-28T10:00:00.000Z", parts: [{ type: "text", text: "find the arm screws" }] },
    {
      id: "u2",
      role: "assistant",
      createdAt: "2026-09-28T10:00:05.000Z",
      meta: { usage: { input_tokens: 1200, output_tokens: 300 } },
      parts: [
        { type: "text", text: "looking" },
        { type: "tool_use", id: "c1", name: "find_parts", input: { query: "arm" } },
        { type: "tool_use", id: "c2", name: "read_manual", input: { page: 12 } },
      ],
    },
    { id: "u3", role: "user", createdAt: "2026-09-28T10:00:06.000Z", parts: [{ type: "tool_result", id: "c1", output: { message: "two" } }, { type: "tool_result", id: "c2", condition: "ERROR", output: { message: "missing" } }] },
  ];
  const threads = [
    thread(daemon, { id: "thread-one-0001", held: reader, label: "echo", updatedAt: "2026-09-28T09:00:00.000Z", buffers: [{ id: "buffer-one-0001", index: 0, status: "DONE", trait: { LABELED: { name: "first", description: "the first step" } }, data: { step: 1, torch: true } }, { id: "buffer-two-0002", index: 1, status: "ACTIVE", trait: { LABELED: { name: "second" } } }] }),
    thread(daemon, { id: "thread-two-0002", held: talker, label: "delta", updatedAt: "2026-09-28T08:00:00.000Z", turns }),
    thread(daemon, { id: "thread-three-03", held: reader, label: "charlie", updatedAt: "2026-09-28T07:00:00.000Z" }),
    thread(daemon, { id: "thread-four-004", held: talker, label: "bravo", updatedAt: "2026-09-28T06:00:00.000Z" }),
    thread(daemon, { id: "thread-five-005", held: reader, label: "alfa", updatedAt: "2026-09-28T05:00:00.000Z" }),
  ];
  const minted = (fields) => thread(daemon, { id: "thread-minted-9", held: [reader, talker, hidden].find((each) => each.id === fields.mode), label: "minted" });
  Object.assign(daemon.entities, {
    mode: repository([reader, talker, hidden]),
    thread: repository(threads, { create: minted }),
    intent: repository([{ id: "i1", slug: "drill", name: "drill", mode: reader }], { create: null }),
    buffer: repository([], {
      create: (fields) => {
        const owner = threads.find((each) => each.id === fields.thread);
        const minted = buffer(owner, { id: "buffer-new-0009", index: 9, ...fields, thread: owner, mode: reader });
        owner.$buffers.set([...owner.$buffers.get(), minted]);
        return minted;
      },
    }),
  });
  const dropped = daemon.entities.buffer.drop;
  Object.assign(daemon.entities.buffer, {
    drop: (id) => {
      dropped(id);
      for (const owner of threads) owner.$buffers.set(owner.$buffers.get().filter((each) => each.id !== id));
    },
  });
  Object.assign(daemon.entities, {
    activity: repository([]),
  });
  const terminals = new Terminals();
  return { daemon, pending, reader, talker, threads, terminals, lighthouse: { $daemons: atom([daemon, pending]) } };
};

specimen.describe("the six panes — mounted over a terminal, a thread and its daemon", () => {
  let dir, document, mount, unmount, flush, panes;
  const dumps = [];
  const quiet = console.error;
  const chatter = console.log;

  specimen.beforeAll(async () => {
    dir = await Deno.makeTempDir({ prefix: "anima-panes-mount-" });
    document = dom();
    ({ mount, unmount } = await import(ENTRY));
    ({ flush } = await import(CLIENT));
    panes = await build(dir);
    console.error = (...args) => dumps.push(String(args[0]?.name ?? args[0]));
    console.log = () => {};
  });
  specimen.afterAll(async () => {
    console.error = quiet;
    console.log = chatter;
    await Deno.remove(dir, { recursive: true });
  });

  const text = (node = document.body) => node.textContent.replace(/\s+/g, " ").trim();
  const classed = (name) => [...document.body.getElementsByClassName(name)];
  const titled = (title) => [...document.body.querySelectorAll("[title]")].filter((element) => element.getAttribute("title") === title);
  const keys = (label) => [...document.body.getElementsByTagName("button")].filter((button) => text(button) === label);
  const typed = (input, value) => {
    input.value = value;
    input.dispatchEvent(new globalThis.window.Event("input", { bubbles: true }));
    fire(input, "input");
  };

  const seated = async (pane, held, walk) => {
    const app = mount(panes[pane], { target: document.body, props: {}, context: new Map([[LIGHTHOUSE, held.lighthouse], [TERMINALS, held.terminals]]) });
    flush();
    await settle();
    flush();
    try {
      await walk();
    } finally {
      unmount(app);
      flush();
    }
  };

  specimen.it("terminals: a row per terminal, the active one selected; activate, close, open", async () => {
    const held = world();
    await seated("Terminals", held, async () => {
      specimen.expect(text()).toContain("no terminals");
      fire(keys("+ terminal")[0], "click");
      flush();
      const first = held.terminals.active;
      first.thread = held.threads[0];
      const second = held.terminals.create();
      flush();
      specimen.expect(classed("terminal-label").map((label) => text(label))).toEqual(["no thread", "echo"]);
      specimen.expect(classed("terminal-meta").map((meta) => text(meta))).toEqual([second.id.slice(0, 6), `alpha/reader · ${first.id.slice(0, 6)}`]);
      specimen.expect(classed("selected").length).toBe(1);

      held.threads[0].label = { name: "renamed" };
      second.$settling.set({ thread: "thread-two-0002", buffer: null });
      flush();
      specimen.expect(classed("terminal-label").map((label) => text(label))).toEqual(["settling", "renamed"]);

      fire(titled("activate this terminal")[1], "click");
      specimen.expect(held.terminals.active.id).toBe(first.id);
      fire(titled("close terminal")[0], "click");
      flush();
      specimen.expect(held.terminals.entities.map((terminal) => terminal.id)).toEqual([first.id]);
    });
  });

  specimen.it("navigation: daemon chips, three threads and a growing page, sort, views, filter, and every verb of the live panel", async () => {
    const held = world();
    const terminal = held.terminals.create();
    await seated("d", held, async () => {
      specimen.expect([titled("alpha · healthy").length, titled("beta · mounting").length]).toEqual([1, 1]);
      specimen.expect(held.daemon.entities.thread.said("find")).toEqual([[{}, { populate: ["mode", "intent"] }]]);
      specimen.expect(classed("nav-card-name").map((name) => text(name))).toEqual(["echo", "delta", "charlie"]);
      specimen.expect(text()).toContain("beta · mounting · modes arrive on mount");

      fire(keys("+ 2 more")[0], "click");
      flush();
      specimen.expect(classed("nav-card-name").map((name) => text(name))).toEqual(["echo", "delta", "charlie", "bravo", "alfa"]);
      specimen.expect(keys("+ 2 more")).toEqual([]);

      fire(titled("sort · recent · click to cycle")[0], "click");
      flush();
      specimen.expect(classed("nav-card-name").map((name) => text(name))).toEqual(["alfa", "bravo", "charlie", "delta", "echo"]);
      specimen.expect(classed("nav-meta").slice(0, 2).map((meta) => text(meta))).toEqual(["alpha", "alpha"]);
      fire(titled("sort · a–z · click to cycle")[0], "click");
      flush();
      specimen.expect(classed("nav-card-name").map((name) => text(name))).toEqual(["delta", "bravo", "echo", "charlie", "alfa"]);
      specimen.expect(classed("nav-meta").slice(0, 3).map((meta) => text(meta))).toEqual(["chat", "chat", "office"]);

      fire(classed("nav-card")[2].parentNode, "click");
      specimen.expect(terminal.thread?.id).toBe("thread-one-0001");
      flush();

      fire(titled("card · click to cycle")[0], "click");
      flush();
      specimen.expect([classed("nav-card").length, titled("click load · dbl-click quick-start · middle-click new terminal").length]).toEqual([0, 5]);
      specimen.expect(classed("nav-origin").map((origin) => text(origin)).slice(0, 3)).toEqual(["alpha › talker", "alpha › talker", "alpha › reader · 2 buf"]);
      fire(titled("list · click to cycle")[0], "click");
      flush();
      specimen.expect([classed("nav-column").length, classed("nav-slot").length]).toEqual([10, 10]);

      const seat = classed("nav-seat")[3];
      fire(seat, "dblclick");
      await settle();
      specimen.expect(terminal.thread.id).toBe("thread-three-03");
      specimen.expect(held.daemon.entities.buffer.said("create")).toEqual([[{ mode: "m-reader", thread: "thread-three-03", data: {} }]]);

      fire(seat, "auxclick", { button: 0 });
      specimen.expect(held.terminals.entities.length).toBe(1);
      fire(seat, "auxclick", { button: 1 });
      specimen.expect([held.terminals.entities.length, held.terminals.active.thread.id]).toEqual([2, "thread-three-03"]);

      fire(titled("delete thread")[4], "click");
      await settle();
      specimen.expect(held.daemon.entities.thread.said("removeOne")).toEqual([[{ id: "thread-five-005" }]]);
      specimen.expect(held.daemon.entities.buffer.said("remove")).toEqual([[{ thread: "thread-five-005" }]]);
      flush();
    });
  });

  specimen.it("navigation: the filter narrows threads and modes, a picked daemon turns into its mode types, a mode and an intent mint a thread", async () => {
    const held = world();
    const terminal = held.terminals.create();
    await seated("d", held, async () => {
      specimen.expect(classed("nav-filter")[0].className.includes("open")).toBe(false);
      fire(titled("filter")[0], "click");
      flush();
      const field = classed("nav-well")[0].getElementsByTagName("input")[0];
      specimen.expect([classed("nav-filter")[0].className.includes("open"), field.focused, field.hasAttribute("disabled"), field.hasAttribute("readonly"), field.hasAttribute("autofocus")]).toEqual([true, true, false, false, false]);
      typed(field, "talk");
      flush();
      specimen.expect(classed("nav-card-name").map((name) => text(name))).toEqual(["delta", "bravo"]);
      specimen.expect(titled("click · new thread (same daemon: re-mode)").map((key) => text(key))).toEqual(["talker chat"]);
      fire(classed("nav-filter")[0], "focusout");
      flush();
      specimen.expect(classed("nav-filter")[0].className.includes("open")).toBe(true);
      typed(field, "");
      fire(classed("nav-filter")[0], "focusout");
      flush();
      specimen.expect(classed("nav-filter")[0].className.includes("open")).toBe(false);
      specimen.expect(classed("nav-well")[0].getElementsByTagName("input")[0] === field).toBe(true);

      fire(titled("alpha · healthy")[0], "click");
      flush();
      specimen.expect([titled("every daemon").map((key) => text(key)), titled("modes of this type").map((key) => text(key))]).toEqual([["alpha ×"], ["office", "chat"]]);
      specimen.expect(text()).not.toContain("modes arrive on mount");
      fire(titled("modes of this type")[1], "click");
      flush();
      specimen.expect(classed("nav-card-name").map((name) => text(name))).toEqual(["delta", "bravo"]);
      specimen.expect(titled("click · new thread (same daemon: re-mode)").map((key) => text(key))).toEqual(["talker chat"]);
      fire(titled("every daemon")[0], "click");
      flush();
      specimen.expect(titled("click · new thread (same daemon: re-mode)").map((key) => text(key))).toEqual(["reader office", "talker chat"]);

      fire(titled("click · new thread (same daemon: re-mode)")[1], "click");
      await settle();
      specimen.expect(held.daemon.entities.thread.said("create")).toEqual([[{ mode: "m-talker" }]]);
      specimen.expect(terminal.thread.id).toBe("thread-minted-9");

      terminal.thread = held.threads[0];
      fire(titled("click · new thread (same daemon: re-mode)")[1], "click");
      await settle();
      specimen.expect(held.daemon.entities.thread.said("updateOne")[0]).toEqual([{ id: "thread-one-0001" }, { mode: "m-talker" }]);
      specimen.expect(held.threads[0].mode.id).toBe("m-talker");

      fire(titled("click · new thread from this intent")[0], "click");
      await settle();
      specimen.expect(held.daemon.entities.thread.said("create")[1]).toEqual([{ mode: "m-reader", intent: "i1" }]);

      fire(titled("fold this daemon")[0], "click");
      flush();
      specimen.expect(titled("click · new thread from this intent")).toEqual([]);
      flush();
    });
  });

  specimen.it("navigation: setting an entrypoint mode opens its buffer — the thread's last on that mode, else a fresh one", async () => {
    const held = world();
    const terminal = held.terminals.create();
    await seated("d", held, async () => {
      const keys = () => titled("click · new thread (same daemon: re-mode)");
      specimen.expect(keys().map((key) => text(key))).toEqual(["reader office", "talker chat"]);

      terminal.thread = held.threads[0];
      fire(keys()[0], "click");
      await settle();
      specimen.expect(held.daemon.entities.buffer.said("create")).toEqual([]);
      specimen.expect(terminal.buffer.id).toBe("buffer-two-0002");

      terminal.thread = held.threads[2];
      fire(keys()[0], "click");
      await settle();
      specimen.expect(held.daemon.entities.buffer.said("create")).toEqual([[{ mode: "m-reader", thread: "thread-three-03", data: {} }]]);
      specimen.expect(terminal.buffer.id).toBe("buffer-new-0009");

      terminal.thread = held.threads[1];
      fire(keys()[1], "click");
      await settle();
      specimen.expect(terminal.buffer).toBe(null);
    });
  });

  specimen.it("navigation: a thread wears the loudest state of its activities and their count", async () => {
    const held = world();
    held.terminals.create();
    await seated("d", held, async () => {
      specimen.expect(classed("status").filter((status) => status.parentNode.className.includes("nav-card-side"))).toEqual([]);
      held.daemon.entities.activity.$entities.set([
        { id: "a1", status: "PAUSED", thread: { id: "thread-two-0002" } },
        { id: "a2", status: "RUNNING", thread: "thread-two-0002" },
      ]);
      flush();
      const worn = classed("status").filter((status) => status.parentNode.className.includes("nav-card-side"));
      specimen.expect(worn.map((status) => [status.className.includes("primary"), text(status), status.getAttribute("title")])).toEqual([[true, "2", "paused · running"]]);
    });
  });

  specimen.it("thread: the crumb, the chips — a toggling trait toggles on its body and opens on its mark, a held trait opens on both", async () => {
    const held = world();
    const terminal = held.terminals.create();
    terminal.thread = held.threads[0];
    await seated("e", held, async () => {
      specimen.expect(text(classed("thread-crumb")[0])).toBe("alpha › Reader office idle cursor 1/2 save as intent");
      specimen.expect(text()).toContain("thread traits 1 on");
      const chip = (title) => titled(title)[0];
      specimen.expect(["labeled", "masked", "aimed", "queueing", "intelligent"].map((name) => keys(name).length + keys(`${name} ▸`).length)).toEqual([1, 1, 1, 1, 1]);
      specimen.expect([chip("held while the application carries a schema · seeds buffers").hasAttribute("disabled"), chip("needs aimed · dropping aimed drops it").hasAttribute("disabled"), chip("needs emitter branches · pull reads the mount").hasAttribute("disabled")]).toEqual([true, true, false]);

      fire(chip("set by the dossier · name + description"), "click");
      flush();
      specimen.expect(classed("tool-name").map((name) => text(name))).toEqual(["labeled"]);
      specimen.expect(held.daemon.entities.thread.said("updateOne")).toEqual([]);

      fire(chip("needs emitter branches · pull reads the mount"), "click");
      await settle();
      flush();
      specimen.expect(held.daemon.entities.thread.said("updateOne")).toEqual([[{ id: "thread-one-0001" }, { traits: ["LABELED", "AIMED"] }]]);
      specimen.expect([held.threads[0].traits, classed("tool-name").map((name) => text(name))]).toEqual([["LABELED", "AIMED"], ["aimed", "labeled"]]);
      specimen.expect(text()).toContain("thread traits 2 on");
      specimen.expect(chip("needs aimed · dropping aimed drops it").hasAttribute("disabled")).toBe(false);

      const marks = classed("chip-mark");
      specimen.expect(marks.map((mark) => text(mark))).toEqual(["▾", "▾", "▸", "▸"]);
      fire(marks[3], "click");
      flush();
      specimen.expect(classed("tool-name").map((name) => text(name))).toEqual(["intelligent", "aimed", "labeled"]);
      specimen.expect(held.threads[0].traits).toEqual(["LABELED", "AIMED"]);

      fire(chip("needs aimed · dropping aimed drops it"), "click");
      await settle();
      fire(chip("needs emitter branches · pull reads the mount"), "click");
      await settle();
      flush();
      specimen.expect(held.threads[0].traits).toEqual(["LABELED"]);

      specimen.expect(classed("tool-name").map((name) => text(name))).toEqual(["queueing", "intelligent", "aimed", "labeled"]);
      fire(classed("tool-face")[1], "click");
      flush();
      specimen.expect(classed("tool-name").map((name) => text(name))).toEqual(["queueing", "aimed", "labeled"]);
    });
  });

  specimen.it("thread: the editors write what the live widgets wrote, and save as intent mints the intent", async () => {
    const held = world();
    const terminal = held.terminals.create();
    held.threads[0].traits = ["LABELED", "AIMED", "QUEUEING"];
    held.threads[0].trait = { AIMED: { mount: "/emit/due" }, QUEUEING: { depth: 2 } };
    terminal.thread = held.threads[0];
    await seated("e", held, async () => {
      for (const mark of classed("chip-mark")) fire(mark, "click");
      flush();
      specimen.expect(classed("tool-name").map((name) => text(name)).sort()).toEqual(["aimed", "intelligent", "labeled", "queueing"]);

      specimen.expect(classed("aimed-path").map((path) => text(path))).toEqual(["/emit/due", "/emit/fresh"]);
      specimen.expect(classed("aimed-meta").map((meta) => text(meta))).toEqual(["mount", ""]);
      fire(titled("aim the thread at this mount")[1], "click");
      await settle();
      specimen.expect(held.daemon.entities.thread.said("updateOne").at(-1)).toEqual([{ id: "thread-one-0001" }, { trait: { AIMED: { mount: "/emit/fresh" }, QUEUEING: { depth: 2 } } }]);

      specimen.expect(classed("queueing-cell").map((cell) => cell.className.includes("full"))).toEqual([true, true, false, false, false, false, false, false]);
      fire(titled("depth 8")[0], "click");
      await settle();
      flush();
      specimen.expect(held.threads[0].trait.QUEUEING).toEqual({ depth: 8 });
      specimen.expect(classed("queueing-cell").filter((cell) => cell.className.includes("full")).length).toBe(7);

      const [name, description] = classed("labeled")[0].getElementsByTagName("input");
      specimen.expect([name.value, description.value, name.hasAttribute("disabled"), name.hasAttribute("readonly")]).toEqual(["echo", "", false, false]);
      typed(name, "echo two");
      typed(description, "what it is for");
      flush();
      specimen.expect(held.threads[0].label).toEqual({ name: "echo two", description: "what it is for", flags: [] });
      specimen.expect(titled("pending sync").length).toBe(1);

      fire(keys("save as intent")[0], "click");
      await settle();
      specimen.expect(held.daemon.entities.intent.said("create")).toEqual([[{ slug: "thread-thread-o", name: "echo two", mode: "m-reader", traits: ["LABELED", "AIMED", "QUEUEING"], trait: held.threads[0].trait }]]);
    });
  });

  specimen.it("thread: the masked editor draws the application's schema and writes the mask, its fields never disabled", async () => {
    const held = world();
    const terminal = held.terminals.create();
    held.reader.application = {
      ...held.reader.application,
      schema: { type: "object", properties: { data: { type: "object", properties: { topic: { type: "string", description: "a topic" }, limit: { type: "integer", default: 5 }, level: { enum: ["plain", "hard"] }, strict: { type: "boolean" } } } } },
    };
    held.threads[0].traits = ["LABELED", "MASKED"];
    terminal.thread = held.threads[0];
    await seated("e", held, async () => {
      fire(titled("held while the application carries a schema · seeds buffers")[0], "click");
      flush();
      specimen.expect(classed("tool-name").map((name) => text(name))).toEqual(["masked"]);
      specimen.expect(classed("form-name").map((name) => text(name))).toEqual(["topic", "limit", "level", "strict"]);
      const form = classed("form")[0];
      const [topic, limit, strict] = form.getElementsByTagName("input");
      const [level] = form.getElementsByTagName("select");
      specimen.expect([topic, limit, strict, level].map((field) => [field.hasAttribute("disabled"), field.hasAttribute("readonly")])).toEqual([[false, false], [false, false], [false, false], [false, false]]);
      specimen.expect([topic.getAttribute("placeholder"), limit.getAttribute("type"), strict.getAttribute("type")]).toEqual(["a topic", "number", "checkbox"]);

      typed(topic, "fasteners");
      typed(limit, "12");
      level.value = "hard";
      fire(level, "change");
      strict.checked = true;
      fire(strict, "change");
      flush();
      specimen.expect(held.threads[0].trait.MASKED).toEqual({ topic: "fasteners", limit: 12, level: "hard", strict: true });
      specimen.expect(text()).toContain("seeds every buffer this thread creates");
      specimen.expect(held.daemon.entities.thread.said("updateOne")).toEqual([]);
    });
  });

  specimen.it("cursor: the phase's verbs, release, open with its busy guard, the queue keys, the buffers and their clear", async () => {
    const held = world();
    const terminal = held.terminals.create();
    terminal.thread = held.threads[0];
    const [first, second] = held.threads[0].$buffers.get();
    const released = [];
    first.on.release((gone) => released.push(gone.id));
    await seated("f", held, async () => {
      specimen.expect(terminal.buffer.id).toBe("buffer-one-0001");
      specimen.expect(text()).toContain("cursor 1 / 2");
      specimen.expect(text(classed("stall-face")[0])).toBe("done first");
      specimen.expect(classed("reading").map((reading) => text(reading))).toEqual(["buffer 0 · one-0001", "description the first step", "mode reader", "view application · /Reader.svelte", "literals 0", "symbols 0", "data show · 2 keys"]);
      specimen.expect(["previous", "next", "home", "more", "stop → manual"].map((title) => titled(title).length)).toEqual([1, 1, 0, 0, 0]);

      fire(titled("next")[0], "click");
      flush();
      specimen.expect([terminal.buffer.id, text(classed("stall-face")[0])]).toEqual(["buffer-two-0002", "active second"]);
      fire(titled("previous")[0], "click");
      flush();
      specimen.expect(terminal.buffer.id).toBe("buffer-one-0001");

      fire(keys("show · 2 keys")[0], "click");
      flush();
      specimen.expect(JSON.parse(text(classed("stall-data")[0]))).toEqual({ step: 1, torch: true });

      specimen.expect(classed("stall-name").map((name) => text(name))).toEqual(["first", "second"]);
      specimen.expect(classed("selected").length).toBe(1);
      fire(titled("")[0], "click");
      flush();

      fire(keys("open")[0], "click");
      fire(keys("…")[0] ?? keys("open")[0], "click");
      await settle();
      flush();
      specimen.expect(held.daemon.entities.buffer.said("create").length).toBe(1);
      specimen.expect(terminal.buffer.id).toBe("buffer-new-0009");

      specimen.expect(keys("start queue")[0].className.includes("muted")).toBe(true);
      fire(keys("start queue")[0], "click");
      specimen.expect([held.threads[0].phase, held.threads[0].$errors.get().length > 0, held.daemon.entities.thread.said("updateOne")]).toEqual(["manual", true, []]);

      terminal.buffer = first;
      flush();
      fire(keys("release")[0], "click");
      flush();
      specimen.expect(released).toEqual(["buffer-one-0001"]);
      specimen.expect([held.daemon.entities.buffer.said("drop"), classed("stall-name").map((name) => text(name)), terminal.buffer.id]).toEqual([[["buffer-one-0001"]], ["second", "buffer 9"], "buffer-two-0002"]);

      fire(titled("delete")[0], "click");
      await settle();
      specimen.expect(held.daemon.entities.buffer.said("removeOne").at(-1)).toEqual([{ id: "buffer-two-0002" }]);
      fire(keys("clear")[0], "click");
      await settle();
      specimen.expect(held.daemon.entities.buffer.said("remove")).toEqual([[{ thread: "thread-one-0001" }]]);
      specimen.expect(terminal.buffer).toBe(null);
    });
  });

  specimen.it("cursor: a thread that cannot open says so, and a harnessed thread carries its activity", async () => {
    const held = world();
    const terminal = held.terminals.create();
    held.reader.traits = ["APPLICATION"];
    terminal.thread = held.threads[2];
    await seated("f", held, async () => {
      specimen.expect(text()).toContain("no buffers · open or pull");
      specimen.expect(keys("open")).toEqual([]);
      specimen.expect([keys("aim required")[0].hasAttribute("disabled"), keys("aim required")[0].getAttribute("title")]).toEqual([true, "this mode has no emitter — toggle AIMED to pull"]);
      specimen.expect(text(classed("stall-aim")[0])).toContain("aim required");
      specimen.expect(text()).not.toContain("activity");

      held.threads[2].phase = "escort";
      flush();
      specimen.expect(["previous", "next", "home"].map((title) => titled(title).length)).toEqual([1, 1, 1]);

      terminal.thread = held.threads[1];
      flush();
      specimen.expect(text()).toContain("activity 0 live");
      specimen.expect(keys("aim required")).toEqual([]);
      specimen.expect(text()).not.toContain("start queue");
    });
  });

  specimen.it("mode: the face, the traits said, the wires read, the threads on it, a new thread", async () => {
    const held = world();
    const terminal = held.terminals.create();
    terminal.thread = held.threads[0];
    await seated("Mode", held, async () => {
      specimen.expect(text(classed("mode-face")[0])).toBe("re Reader office alpha · /mode/office/reader healthy");
      specimen.expect(classed("mode-trait").map((trait) => text(trait))).toEqual([
        "application serves a view · the frame mounts its bundle",
        "standalone opens a buffer without an aim",
        "emitter emits buffers · due, fresh",
        "exposed opens its aperture · 3 routes",
      ]);
      specimen.expect(classed("reading").map((reading) => text(reading))).toEqual([
        "aperture /metadata/aperture · 3 routes",
        "emitter /metadata/emitter · 2 branches",
        "harness —",
        "view svelte · /Reader.svelte",
        "bundle attach/bundle/alpha/reader/",
        "integrity sha256 · 9f2c4d1e8a7b",
      ]);
      specimen.expect(classed("mode-thread").map((name) => text(name))).toEqual(["echo", "charlie", "alfa"]);
      specimen.expect(classed("mode-meta").map((meta) => text(meta))).toEqual(["2 buffers", "0 buffers", "0 buffers"]);

      fire(titled("load into the active terminal")[1], "click");
      flush();
      specimen.expect(terminal.thread.id).toBe("thread-three-03");
      fire(keys("new thread")[0], "click");
      await settle();
      specimen.expect([held.daemon.entities.thread.said("create"), terminal.thread.id]).toEqual([[[{ mode: "m-reader" }]], "thread-minted-9"]);

      held.reader.application = null;
      flush();
      specimen.expect(classed("reading").slice(3).map((reading) => text(reading))).toEqual(["view —", "bundle no source on the client", "integrity no source on the client"]);
    });
  });

  specimen.it("buffer: the frame's status, identity and triple, the hooks held, the data by key, and what has no source said so", async () => {
    const held = world();
    const terminal = held.terminals.create();
    terminal.thread = held.threads[0];
    terminal.buffer.on.mount(() => {});
    await seated("Buffer", held, async () => {
      specimen.expect(text()).toContain("frame");
      specimen.expect(classed("status-word").map((word) => text(word))).toEqual(["done"]);
      specimen.expect(classed("reading").map((reading) => text(reading))).toEqual([
        "buffer first",
        "identity attach/bundle/alpha/reader//Reader.svelte",
        `remount one-0001 · r.svelte · ${terminal.id.slice(-8)}`,
        "step 1",
        "torch true",
      ]);
      specimen.expect(classed("tag").map((tag) => [text(tag), tag.className.includes("lit"), tag.getAttribute("title")])).toEqual([
        ["mount", true, "1 held"],
        ["unmount", false, "0 held"],
        ["release", true, "1 held"],
      ]);
      specimen.expect(classed("buffer-note").map((note) => text(note))).toEqual([
        "lifecycle · the frame keeps its standing to itself, the pane has no source for it",
        "a client buffer holds no wire · the mode's wires are in the mode pane",
      ]);
      terminal.buffer = null;
      held.threads[0].phase = "inert";
      terminal.buffer = null;
      flush();
      specimen.expect(text()).toContain("cursor empty");
    });
  });

  specimen.it("harness: the session's calls with their usage, the manifest, the meter, the tools seen", async () => {
    const held = world();
    const terminal = held.terminals.create();
    terminal.thread = held.threads[1];
    await seated("Harness", held, async () => {
      specimen.expect(text()).toContain("session calls 2 · 1 turns");
      specimen.expect(classed("harness-calls").map((calls) => text(calls))).toEqual(["find_parts · read_manual", "text", "text · tool_use ×2"]);
      specimen.expect(classed("harness-usage").map((usage) => text(usage))).toEqual(["1.2k → 300"]);
      specimen.expect(classed("harness-tile").map((tile) => text(tile))).toEqual(["turns 2", "calls 2", "tools 2", "tokens in 1.2k", "tokens out 300", "context 1.5k"]);
      specimen.expect(text()).toContain("tools seen 2");
      specimen.expect(classed("harness-tool").map((tool) => [text(tool), tool.className.includes("failed")])).toEqual([["find_parts", false], ["read_manual", true]]);

      terminal.thread = held.threads[0];
      flush();
      specimen.expect(text()).toBe("mode is not harnessed no chat, no activity");
    });
  });

  specimen.it("nothing loops and nothing faults", () => {
    specimen.expect(dumps).toEqual([]);
  });
});
