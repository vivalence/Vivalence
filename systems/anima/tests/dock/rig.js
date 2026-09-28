import { compile, compileModule } from "svelte/compiler";
import { parseHTML } from "linkedom";

export const CLIENT = import.meta.resolve("svelte/internal/client");
export const ENTRY = new URL("../../index-client.js", CLIENT).href;
export const SRC = new URL("../../src/", import.meta.url);
export const DRAPES = new URL("../../../../subsystems/drapes/", import.meta.url);

const TYPOLOGY = import.meta.resolve("@vivalence/typology");

export const KIT = {
  Key: new URL("controls/Key.svelte", DRAPES),
  Segmented: new URL("controls/Segmented.svelte", DRAPES),
  Stepper: new URL("controls/Stepper.svelte", DRAPES),
  Empty: new URL("display/Empty.svelte", DRAPES),
  Json: new URL("display/Json.svelte", DRAPES),
  Markdown: new URL("display/Markdown.svelte", DRAPES),
  Meter: new URL("display/Meter.svelte", DRAPES),
  Row: new URL("display/Row.svelte", DRAPES),
  Section: new URL("display/Section.svelte", DRAPES),
  Spinner: new URL("display/Spinner.svelte", DRAPES),
  Status: new URL("display/Status.svelte", DRAPES),
  Tag: new URL("display/Tag.svelte", DRAPES),
  ToolRow: new URL("display/ToolRow.svelte", DRAPES),
  Well: new URL("display/Well.svelte", DRAPES),
  Float: new URL("panels/Float.svelte", DRAPES),
  Frame: new URL("panels/Frame.svelte", DRAPES),
};

const parts = (_, names) => names.split(",").map((name) => `import ${name.trim()} from "./${name.trim()}.js";`).join("\n");

const REWRITES = [
  [/^import ['"]svelte\/internal\/(disclose-version|flags\/[a-z]+)['"];\n?/gm, ""],
  [/from ['"]svelte\/internal\/client['"]/g, `from "${CLIENT}"`],
  [/from "svelte"/g, `from "${ENTRY}"`],
  [/import \{ ([^}]+) \} from "@vivalence\/drapes";/g, parts],
  [/from "(?:\.\.?\/)+(?:[a-z]+\/)*([A-Z][A-Za-z]*)\.svelte"/g, 'from "./$1.js"'],
  [/from "\.\/float\.js"/g, `from "${new URL("panels/float.js", DRAPES).href}"`],
  [/from "\.\/markdown\.js"/g, `from "${new URL("display/markdown.js", DRAPES).href}"`],
  [/from "\.\/turns\.js"/g, `from "${new URL("app/panels/a/widgets/turns.js", SRC).href}"`],
  [/from "\.\/dictate\.js"/g, `from "${new URL("app/panels/a/widgets/dictate.js", SRC).href}"`],
  [/from "\.\/stop\.svelte\.js"/g, 'from "./stop.js"'],
  [/from "\.\.\/panels\/e\/widgets\/intelligent\.js"/g, `from "${new URL("app/panels/e/widgets/intelligent.js", SRC).href}"`],
  [/from "@vivalence\/typology"/g, `from "${TYPOLOGY}"`],
  [/from "\$client"/g, `from "${new URL("client.js", SRC).href}"`],
];

const runes = (url) => url.pathname.endsWith(".svelte.js");

export async function build(directory, widgets, rewrites = []) {
  for (const [name, url] of Object.entries(widgets)) {
    const source = await Deno.readTextFile(url);
    const out = runes(url)
      ? compileModule(source, { generate: "client", filename: `${name}.svelte.js`, dev: true })
      : compile(source, { generate: "client", filename: `${name}.svelte`, css: "external", dev: true });
    let code = out.js.code;
    for (const [from, to] of [...rewrites, ...REWRITES]) code = code.replace(from, to);
    await Deno.writeTextFile(`${directory}/${name}.js`, code);
  }
  return (name) => import(`file://${directory}/${name}.js`);
}

export function dom() {
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
  window.Element.prototype.getBoundingClientRect ??= () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 });
  window.innerWidth ??= 1280;
  window.innerHeight ??= 800;
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

export const fire = (element, type, detail = {}) => {
  const handler = element[`__${type}`];
  const event = Object.assign(new globalThis.window.Event(type), detail);
  Object.defineProperty(event, "currentTarget", { configurable: true, value: element });
  return Array.isArray(handler) ? handler[0].call(element, event, ...handler.slice(1)) : handler.call(element, event);
};

export const send = (element, type) => element.dispatchEvent(new globalThis.window.Event(type));

export const keys = (target) => [...target.getElementsByTagName("button")];

export const words = (target) => target.textContent.replace(/\s+/g, " ").trim();
