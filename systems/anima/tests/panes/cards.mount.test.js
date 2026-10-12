import { specimen, Status } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { parseHTML } from "linkedom";
import { atom } from "nanostores";
import { Terminals } from "../../src/entities/terminal/terminals.js";
import { Bridge } from "../../src/bridge/prototype.js";
import * as panes from "../../src/bridge/panes.js";
import { repositoryDouble } from "./rig.js";
import { Thread } from "../../src/entities/thread/prototype.js";
import { Mode } from "../../src/entities/mode/prototype.js";
import { Buffer } from "../../src/entities/buffer.js";
import { BRIDGE, LIGHTHOUSE, TERMINALS } from "../../src/client.js";

const CLIENT = import.meta.resolve("svelte/internal/client");
const ENTRY = new URL("../../index-client.js", CLIENT).href;
const SRC = new URL("../../src/", import.meta.url);
const DRAPES = new URL("../../../../subsystems/drapes/", import.meta.url);

const CARDS = [
  "app/panels/c/c",
  "app/panels/c/cards/Card",
  "app/panels/c/cards/Row",
  "app/panels/c/cards/Terminals",
  "app/panels/c/cards/Threads",
  "app/panels/c/cards/Modes",
  "app/panels/c/cards/Thread",
  "app/panels/c/cards/Mode",
  "app/panels/c/cards/Buffers",
  "app/panels/c/cards/Buffer",
  "app/panels/c/cards/Harness",
  "app/panels/c/cards/Link",
  "app/widgets/Faculty",
  "app/panels/c/cards/traits/Labeled",
  "app/panels/c/cards/traits/Masked",
  "app/panels/c/cards/traits/Aimed",
  "app/panels/c/cards/traits/Queueing",
  "app/panels/c/cards/traits/form/FormFromSchema",
  "app/panels/c/cards/traits/form/EntityField",
  "app/panels/c/cards/traits/form/EntitySetField",
  "app/panels/c/cards/traits/form/EntityRow",
  "app/panels/c/cards/traits/form/SymbolFacets",
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
  "display/Strip",
  "panels/Float",
  "panels/Card",
];

const SHIM = `
export { chain } from "${new URL("gestalten/belt/chain.js", SRC).href}";
export { TONES, loudest, owed, roster, settled } from "${new URL("entities/activity.js", SRC).href}";
export * as ThreadTraits from "${new URL("thread/traits/index.js", SRC).href}";
export * as ModeTraits from "${new URL("mode/traits/index.js", SRC).href}";
import * as panes from "${new URL("bridge/panes.js", SRC).href}";
import { railGrain } from "${new URL("bridge/prototype.js", SRC).href}";
export const stores = { bridge: { panes, railGrain } };
`;

const rewrites = (url) => {
  const kit = url.href.startsWith(DRAPES.href);
  const local = (name) => (kit ? `./kit-${name}.js` : `./${name}.js`);
  return [
    [/^import ['"]svelte\/internal\/(disclose-version|flags\/[a-z]+)['"];\n?/gm, ""],
    [/from ['"]svelte\/internal\/client['"]/g, `from "${CLIENT}"`],
    [/from "svelte"/g, `from "${ENTRY}"`],
    [/import \{ ([^}]+) \} from "@vivalence\/drapes";?/g, (whole, names) => names.split(",").map((name) => `import ${name.trim()} from "./kit-${name.trim()}.js";`).join("\n")],
    [/from "@vivalence\/anima"/g, 'from "./anima.js"'],
    [/from "\$client"/g, `from "${new URL("client.js", SRC).href}"`],
    [/from "\.{1,2}\/(?:[A-Za-z.]+\/)*([A-Za-z]+)\.svelte"/g, (whole, name) => `from "${local(name)}"`],
    [/from "\.\/strip\.js"/, `from "${new URL("display/strip.js", DRAPES).href}"`],
    [/from "\.\/float\.js"/, `from "${new URL("panels/float.js", DRAPES).href}"`],
    [/from "(\.{1,2}\/[^"]+\.js)"/g, (whole, path) => (/^\.\/(?:kit-)?(?:[A-Z][A-Za-z]*|anima)\.js$/.test(path) ? whole : `from "${new URL(path, url).href}"`)],
  ];
};

async function build(dir) {
  const sources = [...CARDS.map((path) => [new URL(`${path}.svelte`, SRC), ""]), ...KIT.map((path) => [new URL(`${path}.svelte`, DRAPES), "kit-"])];
  for (const [url, prefix] of sources) {
    const name = url.pathname.split("/").pop().replace(".svelte", "");
    let code = compile(await Deno.readTextFile(url), { generate: "client", filename: `${name}.svelte`, css: "external", dev: true }).js.code;
    for (const [from, to] of rewrites(url)) code = code.replace(from, to);
    await Deno.writeTextFile(`${dir}/${prefix}${name}.js`, code);
  }
  await Deno.writeTextFile(`${dir}/anima.js`, SHIM);
  return (await import(`file://${dir}/c.js`)).default;
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
  Object.defineProperty(window.HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 400 });
  Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 40 });
  window.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 400, bottom: 800, width: 400, height: 800 });
  window.HTMLElement.prototype.setPointerCapture = () => {};
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
  const event = { type, target: element, currentTarget: element, button: 0, shiftKey: false, preventDefault() {}, stopPropagation() {}, ...detail };
  return Array.isArray(handler) ? handler[0].call(element, event, ...handler.slice(1)) : handler.call(element, event);
};

const settle = async () => {
  for (let turn = 0; turn < 6; turn += 1) await new Promise((resolve) => setTimeout(resolve, 0));
};

const repository = (rows, verbs = {}) => {
  const $entities = atom(rows);
  const calls = [];
  const resolved = new Map();
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
    resolve: (entity) => void (calls.push(["resolve", entity.id]), resolved.set(entity.id, entity)),
    findOneLocal: ({ id }) => $entities.get().find((entity) => entity.id === id) ?? resolved.get(id) ?? null,
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
  const daemon = { id: "daemon-alpha", slug: "alpha", status: new Status("healthy"), cortex: { find: () => [] }, entities: {}, modes: {} };
  const pending = { slug: "beta", status: new Status("mounting"), entities: {}, modes: {} };
  const reader = mode(daemon, {
    id: "m-reader",
    slug: "reader",
    name: "Reader",
    type: "office",
    traits: ["APPLICATION", "EMITTER", "EXPOSED"],
    metadata: {
      emitter: { branches: { due: { branches: {}, effect: { input: { type: "object", properties: { limit: { type: "integer" } } } } }, fresh: { branches: {}, effect: {} } } },
      aperture: { branches: { look: { branches: {}, effect: {} } } },
    },
  });
  reader.application = { url: "attach/bundle/alpha/reader/", schema: null, view: { kind: "svelte", hash: null, mount: { nature: "/Reader.svelte" }, bundle: { url: "attach/bundle/alpha/reader/", entry: () => ({ integrity: "9f2c4d1e8a7b6c5d" }) } } };
  const talker = mode(daemon, { id: "m-talker", slug: "talker", name: "Talker", type: "chat", traits: ["CONVERSATIONAL", "HARNESSED"], metadata: { harness: { branches: { dialogue: { branches: {} }, object: { branches: {} } } } } });
  const hidden = mode(daemon, { id: "m-hidden", slug: "hidden", type: "tool", traits: [] });
  daemon.modes = { office: { reader }, chat: { talker }, tool: { hidden } };
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
    thread(daemon, { id: "thread-one-0001", held: reader, label: "echo", updatedAt: "2026-09-28T09:00:00.000Z", buffers: [{ id: "buffer-one-0001", index: 0, status: "DONE", trait: { LABELED: { name: "first", description: "the first step" } }, data: { step: 1 } }, { id: "buffer-two-0002", index: 1, status: "ACTIVE", trait: { LABELED: { name: "second" } } }] }),
    thread(daemon, { id: "thread-two-0002", held: talker, label: "delta", updatedAt: "2026-09-28T08:00:00.000Z", turns }),
    thread(daemon, { id: "thread-three-03", held: reader, label: "charlie", updatedAt: "2026-09-28T07:00:00.000Z" }),
    thread(daemon, { id: "thread-four-004", held: talker, label: "bravo", updatedAt: "2026-09-28T06:00:00.000Z" }),
    thread(daemon, { id: "thread-five-005", held: reader, label: "alfa", updatedAt: "2026-09-28T05:00:00.000Z" }),
  ];
  const minted = (fields) => thread(daemon, { id: "thread-minted-9", held: [reader, talker, hidden].find((each) => each.id === fields.mode), label: "minted" });
  Object.assign(daemon.entities, {
    mode: repository([reader, talker, hidden]),
    thread: repository(threads, { create: minted }),
    intent: repository([], { create: null }),
    activity: repository([]),
    buffer: repository([], {
      create: (fields) => {
        const owner = threads.find((each) => each.id === fields.thread);
        const made = buffer(owner, { id: "buffer-new-0009", index: 9, ...fields, thread: owner, mode: reader });
        owner.$buffers.set([...owner.$buffers.get(), made]);
        return made;
      },
      remove: ({ thread: id }) => void threads.find((each) => each.id === id).$buffers.set([]),
    }),
  });
  const terminals = new Terminals(repositoryDouble([daemon]));
  return { daemon, pending, reader, talker, threads, terminals, lighthouse: { $daemons: atom([daemon, pending]) } };
};

const RECT = { left: 0, top: 0, width: 400, height: 800 };

specimen.describe("rail C — five cards over a terminal, a thread and its daemon", () => {
  let dir, document, mount, unmount, flush, Rail;
  const dumps = [];
  const quiet = console.error;
  const chatter = console.log;

  specimen.beforeAll(async () => {
    dir = await Deno.makeTempDir({ prefix: "anima-cards-mount-" });
    document = dom();
    ({ mount, unmount } = await import(ENTRY));
    ({ flush } = await import(CLIENT));
    Rail = await build(dir);
    console.error = (...args) => dumps.push(String(args[0]?.name ?? args[0]));
    console.log = () => {};
  });
  specimen.afterAll(async () => {
    console.error = quiet;
    console.log = chatter;
    await Deno.remove(dir, { recursive: true });
  });

  const text = (node = document.body) => node.textContent.replace(/\s+/g, " ").trim();
  const cards = () => [...document.body.querySelectorAll(".card")];
  const labels = () => cards().map((card) => text(card.querySelector(".card-label")));
  const find = (label) => cards().find((held) => text(held.querySelector(".card-label")) === label);
  const meta = (card) => text(card.querySelector(".card-meta"));
  const rows = (card) => [...card.querySelectorAll(".card-row")];
  const keys = (card, label) => [...card.getElementsByTagName("button")].filter((button) => text(button) === label);
  const key = (card, label) => keys(card, label)[0];
  const chip = (card, label) => [...card.getElementsByTagName("button")].find((button) => text(button).startsWith(label));

  const seated = async (held, walk) => {
    globalThis.localStorage.removeItem("vivalence:bridge");
    const bridge = new Bridge();
    bridge.panels.c.tree = panes.PANE_NAMES.reduce((tree, name) => panes.open(tree, name), null);
    bridge.panels.c.fold = "stack";
    const app = mount(Rail, { target: document.body, props: { rect: RECT }, context: new Map([[BRIDGE, bridge], [LIGHTHOUSE, held.lighthouse], [TERMINALS, held.terminals]]) });
    flush();
    await settle();
    flush();
    try {
      await walk(bridge);
    } finally {
      unmount(app);
      flush();
    }
  };

  const turn = async () => {
    flush();
    await settle();
    flush();
  };

  specimen.it("the rail in the stack fold: with no terminal the two cards a terminal needs nothing for; with a seated thread the cards it can show, in the comp's order", async () => {
    const held = world();
    await seated(held, () => {
      specimen.expect(labels()).toEqual(["terminals"]);
      specimen.expect(text(find("terminals"))).toContain("no terminals");
      specimen.expect(keys(find("terminals"), "+ terminal")).toHaveLength(2);
    });
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[0]);
    await seated(held, () => {
      specimen.expect(labels()).toEqual(["terminals", "threads", "modes", "thread", "mode", "buffers", "buffer"]);
      specimen.expect([...document.body.querySelectorAll(".card.framed.flowing")]).toHaveLength(7);
    });
  });

  specimen.it("terminals: a row per terminal, the active one pressed; + terminal spawns one, ✕ closes one", async () => {
    const held = world();
    const first = await held.terminals.create();
    await held.terminals.create();
    await seated(held, async () => {
      const card = find("terminals");
      specimen.expect(rows(card)).toHaveLength(2);
      specimen.expect(rows(card)[1].classList.contains("selected")).toBe(true);
      specimen.expect(text(rows(card)[0])).toContain(first.id.slice(0, 6));
      fire(key(card, "+ terminal"), "click");
      await turn();
      specimen.expect(rows(find("terminals"))).toHaveLength(3);
      fire(find("terminals").querySelector('button[title="close terminal"]'), "click");
      await turn();
      specimen.expect(rows(find("terminals"))).toHaveLength(2);
      specimen.expect(held.terminals.entities.map((terminal) => terminal.id)).not.toContain(first.id);
    });
  });

  specimen.it("threads: the daemon in the head, three threads then the rest on a tap, a row seats the terminal; modes: a row re-modes a thread on its daemon", async () => {
    const held = world();
    await held.terminals.create();
    await seated(held, async () => {
      const card = find("threads");
      specimen.expect(meta(card)).toBe("alpha");
      specimen.expect(rows(card).map((row) => text(row).split(" ")[0])).toEqual(["echo", "delta", "charlie"]);
      fire(key(card, "+ 2 more"), "click");
      await turn();
      specimen.expect(rows(find("threads"))).toHaveLength(5);
      specimen.expect(key(find("threads"), "less")).toBeDefined();
      specimen.expect(rows(find("modes")).map((row) => text(row).split(" ")[0])).toEqual(["Reader", "Talker"]);
      specimen.expect(meta(find("modes"))).toBe("alpha");
      fire(rows(find("threads"))[1], "click");
      await turn();
      specimen.expect(held.terminals.active.$thread.get()?.id).toBe("thread-two-0002");
      fire(rows(find("modes"))[0], "click");
      await turn();
      specimen.expect(held.daemon.entities.thread.said("updateOne")[0]).toEqual([{ id: "thread-two-0002" }, { mode: "m-reader" }]);
    });
  });

  specimen.it("threads crud: + mints on the seated thread's mode, ✎ renames into LABELED, ✕ arms then removes", async () => {
    const held = world();
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[0]);
    await seated(held, async () => {
      fire(key(find("threads"), "+"), "click");
      await turn();
      specimen.expect(held.daemon.entities.thread.said("create")[0]).toEqual([{ mode: "m-reader" }]);
      const row = rows(find("threads"))[1];
      fire(key(row, "✎"), "click");
      await turn();
      const field = find("threads").querySelector(".threads-field");
      field.value = "renamed";
      fire(field, "input");
      fire(field, "keydown", { key: "Enter" });
      await turn();
      specimen.expect(held.daemon.entities.thread.said("updateOne").at(-1)).toEqual([{ id: "thread-two-0002" }, { trait: { LABELED: { name: "renamed" } } }]);
      fire(key(rows(find("threads"))[2], "✕"), "click");
      await turn();
      specimen.expect(text(rows(find("threads"))[2])).toContain("delete?");
      specimen.expect(held.daemon.entities.thread.said("removeOne")).toHaveLength(0);
      fire(key(rows(find("threads"))[2], "✕"), "click");
      await turn();
      specimen.expect(held.daemon.entities.thread.said("removeOne")[0]).toEqual([{ id: "thread-three-03" }]);
    });
  });

  specimen.it("mode: the mark, name · type, the pills; new thread mints one on the mode and seats it; replace reveals the modes pane", async () => {
    const held = world();
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[0]);
    await seated(held, async () => {
      const card = find("mode");
      specimen.expect(text(card.querySelector(".mode-mark"))).toBe("RE");
      specimen.expect(text(card)).toContain("Reader");
      specimen.expect([...card.querySelectorAll(".card-pill")].map(text)).toEqual(["application", "emitter", "exposed"]);
      fire(key(card, "new thread"), "click");
      await turn();
      specimen.expect(held.daemon.entities.thread.said("create")[0]).toEqual([{ mode: "m-reader" }]);
      specimen.expect(terminal.$thread.get()?.id).toBe("thread-minted-9");
    });
  });

  specimen.it("thread: the crumb, the links, a trait chip; buffers: the cursor's verbs, the list sets the cursor", async () => {
    const held = world();
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[0]);
    await seated(held, async () => {
      const card = find("thread");
      specimen.expect(text(card)).toContain("alpha › echo");
      specimen.expect(text(card)).toContain("idle");
      specimen.expect([...card.querySelectorAll(".card-link")].map(text)).toEqual(["mode · Reader›", "buffers · 1 / 2›"]);
      specimen.expect(keys(card, "next ›")).toHaveLength(0);
      specimen.expect(meta(find("buffers"))).toBe("1 / 2");
      specimen.expect(rows(find("buffers"))[0].classList.contains("selected")).toBe(true);
      specimen.expect(text(rows(find("buffers"))[0])).toContain("first");
      fire(key(find("buffers"), "next ›"), "click");
      await turn();
      specimen.expect(meta(find("buffers"))).toBe("2 / 2");
      fire(key(find("buffers"), "‹ prev"), "click");
      await turn();
      specimen.expect(terminal.$buffer.get()?.id).toBe("buffer-one-0001");
      fire(rows(find("buffers"))[1], "click");
      await turn();
      specimen.expect(terminal.$buffer.get()?.id).toBe("buffer-two-0002");
      fire(chip(find("thread"), "aimed"), "click");
      await turn();
      specimen.expect(held.daemon.entities.thread.said("updateOne").at(-1)).toEqual([{ id: "thread-one-0001" }, { traits: ["LABELED", "AIMED"] }]);
      held.threads[0].traits = ["LABELED"];
      await turn();
      fire(key(find("buffers"), "open"), "click");
      await turn();
      const [created] = held.daemon.entities.buffer.said("create")[0];
      specimen.expect([created.thread, created.mode]).toEqual(["thread-one-0001", "m-reader"]);
      specimen.expect(terminal.$buffer.get()?.id).toBe("buffer-new-0009");
      specimen.expect(meta(find("buffers"))).toBe("3 / 3");
    });
  });

  specimen.it("buffer: the cursor's name, its mode, the hooks a view holds", async () => {
    const held = world();
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[0]);
    const first = held.threads[0].$buffers.get()[0];
    first.on.release(() => {});
    terminal.$buffer.set(first);
    await seated(held, () => {
      const card = find("buffer");
      specimen.expect(meta(card)).toBe("1 / 2");
      specimen.expect(text(card)).toContain("Reader · office");
      const pills = [...card.querySelectorAll(".buffer-hook")];
      specimen.expect(pills.map(text)).toEqual(["mount", "unmount", "release"]);
      specimen.expect(pills.map((pill) => pill.classList.contains("lit"))).toEqual([false, false, true]);
    });
  });

  specimen.it("harness: the meter's four tiles, a tune key writes the trait and presses, rounds start at 10, step and clear", async () => {
    const held = world();
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[1]);
    await seated(held, async () => {
      const card = find("harness");
      specimen.expect(meta(card)).toBe("delta");
      specimen.expect([...card.querySelectorAll(".harness-tile .card-dim")].map(text)).toEqual(["input", "output", "context", "calls"]);
      specimen.expect([...card.querySelectorAll(".harness-value")].map(text)).toEqual(["1.2k", "300", "1.5k", "2"]);
      fire(key(card, "balanced"), "click");
      await turn();
      const [where, patch] = held.daemon.entities.thread.said("updateOne").at(-1);
      specimen.expect(where).toEqual({ id: "thread-two-0002" });
      specimen.expect(patch.trait.INTELLIGENT).toEqual({ tune: "balanced" });
      specimen.expect(patch.traits).toContain("INTELLIGENT");
      specimen.expect(key(find("harness"), "balanced").classList.contains("pressed")).toBe(true);
      fire(key(find("harness"), "+"), "click");
      await turn();
      specimen.expect(held.threads[1].trait.INTELLIGENT.rounds).toBe(10);
      fire(key(find("harness"), "+"), "click", { shiftKey: true });
      await turn();
      specimen.expect(held.threads[1].trait.INTELLIGENT.rounds).toBe(20);
      fire(key(find("harness"), "−"), "click");
      await turn();
      specimen.expect(held.threads[1].trait.INTELLIGENT.rounds).toBe(19);
      fire(key(find("harness"), "19"), "click");
      await turn();
      specimen.expect(held.threads[1].trait.INTELLIGENT).toEqual({ tune: "balanced" });
      specimen.expect(key(find("harness"), "—")).toBeDefined();
    });
  });

  specimen.it("a thread on an unharnessed mode: the rail masks the harness card", async () => {
    const held = world();
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[0]);
    await seated(held, () => {
      specimen.expect(find("harness")).toBeUndefined();
      specimen.expect(labels()).not.toContain("harness");
    });
  });

  specimen.it("a link in the thread card opens the pane it names", async () => {
    const held = world();
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[0]);
    await seated(held, async (bridge) => {
      fire(find("thread").querySelector('button[title^="open the buffers card"]'), "click");
      await turn();
      specimen.expect(bridge.panels.c.expanded).toBe("buffers");
    });
  });

  specimen.it("buffers · buffer: clear drops the cursor and removes every buffer of the thread", async () => {
    const held = world();
    const terminal = await held.terminals.create();
    await terminal.seat(held.threads[0]);
    await seated(held, async () => {
      fire(key(find("buffers"), "clear"), "click");
      await turn();
      specimen.expect(terminal.$buffer.get()).toBe(null);
      specimen.expect(held.daemon.entities.buffer.said("remove")[0]).toEqual([{ thread: "thread-one-0001" }]);
    });
  });

  specimen.it("nothing loops and nothing faults", () => {
    specimen.expect(dumps).toEqual([]);
  });
});
