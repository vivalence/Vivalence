import { compile, fire, screen, settle, words } from "@vivalence/drapes/scenarios";
import * as esbuild from "esbuild";
import { atom } from "nanostores";
import { tokens } from "@vivalence/dapper";
import { Controller, Span, Vector } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

export { fire, settle, words };

const SURFACE = new URL("../src/surface/", import.meta.url).pathname;
const PARTS = new URL("../../../subsystems/drapes/parts.js", import.meta.url).pathname;
const NODE_MODULES = new URL("../../../node_modules/", import.meta.url).pathname;
const ENTRY = `export * from "./panes/index.js"; export * from "./renderers.js"; export * from "./view.js"; export { render } from "solid-js/web"; export { forgetting, screen } from "./screen.js";`;

const drapes = {
  name: "drapes-parts",
  setup(build) {
    build.onResolve({ filter: /^@vivalence\/drapes\/parts$/ }, () => ({ path: PARTS }));
  },
};

const bundle = async () => {
  const result = await esbuild.build({
    stdin: { contents: ENTRY, resolveDir: SURFACE, loader: "js" },
    bundle: true,
    format: "esm",
    platform: "browser",
    write: false,
    external: ["@vivalence/typology", "@vivalence/ghost", "@vivalence/dapper", "nanostores"],
    nodePaths: [NODE_MODULES],
    plugins: [drapes, compile],
    logLevel: "silent",
  });
  await esbuild.stop();
  const directory = await Deno.makeTempDir({ prefix: "anima-surface-" });
  await Deno.writeTextFile(`${directory}/surface.js`, result.outputFiles[0].text);
  return await import(`file://${directory}/surface.js`);
};

export const surface = await bundle();

export const paint = (part) => screen(part, { render: surface.render });

const turned = (role, at, parts) => ({ role, createdAt: at, parts });

export const world = () => {
  const sent = [];
  const controller = new Controller({ stdout: new Span("anima") });
  const client = new ghost.client.Client({
    controller,
    mask: { manifest: { slug: "anima", type: "client" }, trait: {} },
    surface: surface.screen({ kind: "dom", places: ["cell", "frame"], dark: true, narrow: false, width: 1280, height: 800, palette: () => tokens.kebab("northsea", "2") }),
  });
  client.surface.$sidebar.set(true);
  const lighthouse = Object.assign(new ghost.entities.lighthouse.Lighthouse(), { stdout: controller.stdout.branch("lighthouse"), manifest: { type: "lighthouse", slug: "lighthouse", traits: ["AUTOLOGIN"] } });
  const chat = { type: "chat", slug: "chat", traits: ["HARNESSED"], repl: new Vector(), keymap: new Vector(), host: { reference: { absolute: "/runtime/stub" } }, reference: { absolute: "/runtime/stub/mode/chat/chat" }, implements: (trait) => trait === "HARNESSED" };
  const thread = Object.assign(new ghost.entities.thread.Thread(), {
    id: "thread-1",
    mode: chat,
    traits: ["LABELED", "INTELLIGENT"],
    trait: { LABELED: { name: "first words" }, INTELLIGENT: { tune: "fast", effort: "low", rounds: 6 } },
    $buffers: atom([]),
    $turns: atom([
      turned("user", "2026-10-21T10:00:00.000Z", [{ type: "text", text: "ciao, come stai?" }]),
      turned("assistant", "2026-10-21T10:00:05.000Z", [
        { type: "text", text: "bene, grazie" },
        { type: "tool_use", id: "call-1", name: "lookup", input: { word: "bene" } },
        { type: "tool_result", id: "call-1", condition: "NOMINAL", output: "well" },
      ]),
    ]),
  });
  const seated = (index, held) => {
    const terminal = {
      id: `terminal-${index + 1}`,
      index,
      client,
      controller: controller.branch(`terminal/terminal-${index + 1}`),
      repl: {
        $catalog: atom(null),
        get catalog() {
          return this.$catalog.get();
        },
        commands: new Vector(),
        dispatch: (line) => {
          sent.push(line);
          return Promise.resolve(line);
        },
      },
      dock: { ...ghost.belt.dock.DEFAULT_DOCK },
      $thread: atom(held),
      $buffer: atom(null),
      get thread() {
        return this.$thread.get();
      },
      get buffer() {
        return this.$buffer.get();
      },
      get mode() {
        return this.thread === null ? null : this.thread.mode;
      },
    };
    terminal.legend = new ghost.terminal.Legend(terminal);
    return terminal;
  };
  const terminal = seated(0, thread);
  const spare = seated(1, null);
  const entities = {
    terminal: { $entities: atom([terminal, spare]) },
    thread: { $entities: atom([thread]) },
    mode: { $entities: atom([chat]) },
    activity: { $entities: atom([]) },
    daemon: { $entities: atom([]) },
  };
  const seat = () => {
    client.runtime = {
      lighthouse,
      entities,
      reference: { absolute: "/runtime/stub" },
      $status: atom({ code: "HEALTHY" }),
      get status() {
        return this.$status.get();
      },
    };
    controller.stdout.log({ lighthouse: "http://localhost:2501", traits: ["AUTOLOGIN"] });
  };
  const authorize = () => {
    lighthouse.$user.set({ id: "user-1", slug: "beef", trait: {} });
    lighthouse.$authority.set({ access: "access", refresh: "refresh" });
    lighthouse.$status.set({ code: "AUTHENTICATED" });
  };
  const activate = () => client.$terminal.set(terminal);
  return { client, controller, lighthouse, thread, terminal, spare, entities, sent, seat, authorize, activate };
};
