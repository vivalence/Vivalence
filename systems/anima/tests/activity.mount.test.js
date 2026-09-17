import { specimen } from "@vivalence/typology";
import { compile } from "svelte/compiler";
import { parseHTML } from "linkedom";
import { atom } from "nanostores";

const CLIENT = import.meta.resolve("svelte/internal/client");
const ENTRY = new URL("../../index-client.js", CLIENT).href;
const SRC = new URL("../src/", import.meta.url);
const DRAPES = new URL("../../../subsystems/drapes/", import.meta.url);

const WIDGETS = {
  ActivitySection: new URL("app/panels/f/widgets/ActivitySection.svelte", SRC),
  ActivityRow: new URL("app/panels/f/widgets/ActivityRow.svelte", SRC),
  ActivityTracker: new URL("app/widgets/ActivityTracker.svelte", SRC),
  Section: new URL("display/Section.svelte", DRAPES),
};

const REWRITES = [
  [/^import ['"]svelte\/internal\/(disclose-version|flags\/[a-z]+)['"];\n?/gm, ""],
  [/from ['"]svelte\/internal\/client['"]/g, `from "${CLIENT}"`],
  [/from "svelte"/g, `from "${ENTRY}"`],
  [/import \{ Section \} from "@vivalence\/drapes"/, 'import Section from "./Section.js"'],
  [/from "\.\/ActivityRow\.svelte"/, 'from "./ActivityRow.js"'],
  [/from "\.\.\/\.\.\/\.\.\/widgets\/ActivityTracker\.svelte"/, 'from "./ActivityTracker.js"'],
  [/from "\.\/activity\.js"/, `from "${new URL("app/panels/f/widgets/activity.js", SRC).href}"`],
];

async function build(dir) {
  for (const [name, url] of Object.entries(WIDGETS)) {
    const out = compile(await Deno.readTextFile(url), { generate: "client", filename: `${name}.svelte`, css: "external", dev: true });
    let code = out.js.code;
    for (const [from, to] of REWRITES) code = code.replace(from, to);
    await Deno.writeTextFile(`${dir}/${name}.js`, code);
  }
  return `${dir}/ActivitySection.js`;
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
  Object.assign(globalThis, {
    window, document,
    Node: window.Node, Element: window.Element, HTMLElement: window.HTMLElement, Text: window.Text, Comment: window.Comment,
    DocumentFragment: window.DocumentFragment, Event: window.Event, CustomEvent: window.CustomEvent,
    HTMLMediaElement: window.HTMLMediaElement ?? class {},
    MutationObserver: window.MutationObserver ?? class { observe() {} disconnect() {} },
    requestAnimationFrame: (fn) => setTimeout(fn, 16),
    getComputedStyle: () => ({ getPropertyValue: () => "" }),
  });
  return document;
}

const row = (id, status = "IDLE", thread = "t1") => {
  const signals = [];
  return {
  id, status, error: null, steps: [], thread, mode: { id: "m1" }, turn: { id: "turn-1" }, buffer: null,
  toJSON() { return { id: this.id, status: this.status, error: this.error, steps: this.steps, thread: this.thread }; },
  signals,
  stdin: {
    SIGTERM: (input) => Promise.resolve(void signals.push(["SIGTERM", input])),
    SIGKILL: (input) => Promise.resolve(void signals.push(["SIGKILL", input])),
  },
  };
};

const press = (element, type) => {
  const handler = element[`__${type}`];
  const event = new globalThis.window.Event(type);
  return Array.isArray(handler) ? handler[0].call(element, event, ...handler.slice(1)) : handler.call(element, event);
};

specimen.describe("activity section — mounted, and driven the way the wire drives it", () => {
  let dir, document, mount, unmount, flush, ActivitySection;
  const dumps = [];
  const quiet = console.error;
  specimen.beforeAll(async () => {
    dir = await Deno.makeTempDir({ prefix: "anima-activity-mount-" });
    document = dom();
    ({ mount, unmount } = await import(ENTRY));
    ({ flush } = await import(CLIENT));
    ({ default: ActivitySection } = await import(`file://${await build(dir)}`));
    console.error = (...args) => dumps.push(String(args[0]?.name ?? args[0]));
  });
  specimen.afterAll(async () => {
    console.error = quiet;
    await Deno.remove(dir, { recursive: true });
  });

  const text = () => document.body.textContent.replace(/\s+/g, " ").trim();

  specimen.it("a row updated IN PLACE re-projects on every store tick, other threads fold, a deleted row lingers with its outcome — and nothing loops", () => {
    const $entities = atom([]);
    const thread = { id: "t1", daemon: { entities: { activity: { $entities } } } };
    const app = mount(ActivitySection, { target: document.body, props: { thread, density: "line" } });
    flush();
    specimen.expect(text()).toContain("no activity");

    const a = row("a-1");
    $entities.set([a]);
    flush();
    specimen.expect(text()).toContain("/hallucination IDLE 0.0s");

    for (let i = 0; i < 300; i++) {
      a.status = "RUNNING";
      a.steps.push({ span: 1, trace: null, path: "/hallucination/lookup", verb: i === 0 ? "open" : "note", at: 1000 + i * 40 });
      if (a.steps.length > 12) a.steps.shift();
      $entities.set([a]);
      flush();
    }
    specimen.expect(text()).toContain("/hallucination/lookup RUNNING 0.4s");

    const b = row("b-2", "RUNNING", "t2");
    $entities.set([a, b]);
    flush();
    specimen.expect(text()).toContain("other threads 1");
    specimen.expect(text()).not.toContain("b-2");

    a.status = "DONE";
    $entities.set([a, b]);
    flush();
    specimen.expect(text()).toContain("DONE 0.4s");

    $entities.set([b]);
    flush();
    specimen.expect(text()).toContain("DONE 0.4s");
    specimen.expect(text()).toContain("activity 1");

    unmount(app);
    flush();
    specimen.expect(dumps).toEqual([]);
  });
  specimen.it("KILL fires only after the hold: a click sends nothing, a 700ms hold sends SIGKILL with the reason the daemon's Failure reads", async () => {
    const $entities = atom([]);
    const thread = { id: "t1", daemon: { entities: { activity: { $entities } } } };
    const a = row("k-1", "STOPPING");
    const app = mount(ActivitySection, { target: document.body, props: { thread, density: "line" } });
    $entities.set([a]);
    flush();
    press(document.body.getElementsByClassName("head")[0], "click");
    flush();
    const kill = document.body.getElementsByClassName("kill")[0];
    specimen.expect(kill).toBeTruthy();

    press(kill, "pointerdown");
    await new Promise((resolve) => setTimeout(resolve, 200));
    press(kill, "pointerup");
    await new Promise((resolve) => setTimeout(resolve, 700));
    specimen.expect(a.signals).toEqual([]);

    press(kill, "pointerdown");
    await new Promise((resolve) => setTimeout(resolve, 900));
    press(kill, "pointerup");
    specimen.expect(a.signals).toEqual([["SIGKILL", "user pressed kill"]]);

    unmount(app);
    flush();
  });
});
