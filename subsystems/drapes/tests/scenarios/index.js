import * as esbuild from "esbuild";
import * as babel from "@babel/core";
import solid from "babel-preset-solid";
import { parseHTML } from "linkedom";

export const THEMES = ["northsea", "parchment", "porcelain", "datasette"];
export const ZONES = ["0", "1", "2", "3"];

const PACKAGE = new URL("../../", import.meta.url).pathname;
const NODE_MODULES = new URL("../../../../node_modules/", import.meta.url).pathname;
const ENTRY = `export * from "./parts.js"; export { render } from "solid-js/web"; export { createSignal, createRoot } from "solid-js";`;

const install = () => {
  const { window, document } = parseHTML("<!doctype html><html><head></head><body></body></html>");
  Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return this.textContent.length * 7 + 20;
    },
  });
  Object.defineProperty(window.HTMLTextAreaElement.prototype, "setSelectionRange", {
    configurable: true,
    value(start, end) {
      this.selectionStart = start;
      this.selectionEnd = end;
    },
  });
  Object.assign(globalThis, {
    window,
    document,
    Node: window.Node,
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    Text: window.Text,
    Comment: window.Comment,
    DocumentFragment: window.DocumentFragment,
    SVGElement: window.SVGElement,
  });
  return { window, document };
};

export const { window, document } = "document" in globalThis ? { window: globalThis.window, document: globalThis.document } : install();

export const compile = {
  name: "solid",
  setup(build) {
    build.onLoad({ filter: /\.jsx$/ }, async (args) => {
      const source = await Deno.readTextFile(args.path);
      const out = await babel.transformAsync(source, {
        filename: args.path,
        presets: [[solid, { generate: "dom" }]],
        babelrc: false,
        configFile: false,
      });
      return { contents: out.code, loader: "js" };
    });
  },
};

const bundle = async () => {
  const result = await esbuild.build({
    stdin: { contents: ENTRY, resolveDir: PACKAGE, loader: "js" },
    bundle: true,
    format: "esm",
    platform: "browser",
    write: false,
    external: ["@vivalence/*"],
    nodePaths: [NODE_MODULES],
    plugins: [compile],
    logLevel: "silent",
  });
  await esbuild.stop();
  const directory = await Deno.makeTempDir({ prefix: "drapes-parts-" });
  await Deno.writeTextFile(`${directory}/parts.js`, result.outputFiles[0].text);
  return await import(`file://${directory}/parts.js`);
};

export const parts = await bundle();

export const screen = (part, { document = globalThis.document, render = parts.render } = {}) => {
  const target = document.createElement("div");
  document.body.append(target);
  const dispose = render(part, target);
  return {
    target,
    text: () => target.textContent,
    close: () => {
      dispose();
      target.remove();
    },
  };
};

export const fire = (element, type, init = {}) => {
  const event = new window.Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, init);
  element.dispatchEvent(event);
  return event;
};

const texts = (node) => {
  if (node.nodeType === 3) return [node.data];
  if (node.nodeType === 1 && node.hasAttribute("inert")) return [];
  return [...node.childNodes].flatMap(texts);
};

export const words = (element) =>
  texts(element)
    .map((text) => text.replace(/\s+/g, " ").trim())
    .filter((text) => text !== "")
    .join(" ");

export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
