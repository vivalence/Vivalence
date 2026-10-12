import * as esbuild from "esbuild";
import * as babel from "@babel/core";
import solid from "babel-preset-solid";
import { parseHTML } from "linkedom";
import { atom } from "nanostores";

const ENTRY = new URL("../../dom/index.js", import.meta.url).pathname;
const NODE_MODULES = new URL("../../../../node_modules/", import.meta.url).pathname;

export const THEMES = ["northsea", "parchment", "porcelain", "datasette"];

const install = () => {
  const { window, document } = parseHTML("<!doctype html><html><head></head><body></body></html>");
  Object.defineProperty(window.HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return this.textContent.length * 7 + 20;
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

export const { window, document } = install();

const compile = {
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
    entryPoints: [ENTRY],
    bundle: true,
    format: "esm",
    platform: "browser",
    write: false,
    external: ["@vivalence/*", "nanostores"],
    nodePaths: [NODE_MODULES],
    plugins: [compile],
    logLevel: "silent",
  });
  await esbuild.stop();
  const directory = await Deno.makeTempDir({ prefix: "drapes-dom-" });
  await Deno.writeTextFile(`${directory}/dom.js`, result.outputFiles[0].text);
  return await import(`file://${directory}/dom.js`);
};

export const surface = bundle();

export const fresh = (theme) => {
  document.body.replaceChildren();
  document.head.replaceChildren();
  document.documentElement.removeAttribute("data-theme");
  const root = document.createElement("div");
  document.body.append(root);
  return { root, theme };
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

const daemon = (type, slug, code) => ({
  slug,
  reference: { absolute: `/${type}/${slug}` },
  $status: atom({ code }),
  $modes: atom([]),
  get modes() {
    return this.$modes.get();
  },
});

const mode = (held, slug, type, traits) => ({
  slug,
  type,
  name: `${slug} mode`,
  traits,
  reference: { absolute: `${held.reference.absolute}/mode/${type}/${slug}` },
  get manifest() {
    return { slug: this.slug, type: this.type, name: this.name, traits: this.traits };
  },
});

const thread = (id, name, held, turns) => ({
  id,
  label: name === "" ? "" : { name, description: null, flags: [] },
  mode: held,
  $turns: atom(turns),
  $live: atom(null),
  $echo: atom(null),
});

const terminal = (id, seated) => ({ id, $thread: atom(seated), $buffer: atom(null) });

export const world = () => {
  const accessed = [];
  const sent = [];
  const lighthouse = {
    $user: atom({ id: "user-1", slug: "beef" }),
    $status: atom({ code: "VERIFIED" }),
    $isAuthorized: atom(true),
    manifest: { type: "lighthouse", slug: "lighthouse", traits: [] },
    implements(name) {
      return this.manifest !== null && this.manifest.traits.includes(name);
    },
    login: (username, password) => accessed.push({ route: "/lighthouse/login", username, password }),
    signup: (username, password) => accessed.push({ route: "/lighthouse/signup", username, password }),
  };
  const core = daemon("runtime", "runtime", "HEALTHY");
  const education = daemon("daemon", "education", "MOUNTING");
  const chat = mode(core, "chat", "chat", ["HARNESSED"]);
  const reader = mode(education, "reader", "editor", ["APPLICATION", "HARNESSED"]);
  const scout = mode(education, "scout", "tools", ["TOOLING"]);
  core.$modes.set([chat]);
  education.$modes.set([reader, scout]);
  const first = thread("thread-1", "first words", chat, [
    { role: "user", parts: [{ type: "text", text: "ciao, come stai?" }] },
    { role: "assistant", parts: [{ type: "text", text: "**bene**, grazie" }] },
  ]);
  const other = thread("thread-2", "reading notes", reader, []);
  const seated = terminal("terminal-1", first);
  const spare = terminal("terminal-2", null);
  const entities = {
    daemon: { $entities: atom([education]) },
    thread: { $entities: atom([first, other]) },
    terminal: { $entities: atom([seated, spare]) },
  };
  const runtime = {
    reference: { absolute: "/runtime/runtime" },
    lighthouse,
    entities,
    daemon: core,
    get daemons() {
      return entities.daemon.$entities.get();
    },
  };
  const client = {
    mask: { manifest: { slug: "hello-world" } },
    runtime,
    terminals: { $active: atom(seated), $entities: entities.terminal.$entities },
    dispatch: (input) => sent.push(input),
  };
  return { client, runtime, lighthouse, accessed, sent, core, education, thread: first, other, terminal: seated, spare, modes: { chat, reader, scout } };
};
