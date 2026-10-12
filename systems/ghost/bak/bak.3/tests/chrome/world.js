import { atom, computed } from "nanostores";
import { testRender } from "@opentui/solid";
import { Runtime } from "../../prototypes/runtime.js";

export const THEMES = ["northsea", "parchment", "porcelain", "datasette"];

const turn = (role, text) => ({ role, parts: [{ type: "text", text }] });

const thread = (id, name, mode, turns) => ({
  id,
  label: name === "" ? "" : { name, description: null, flags: [] },
  mode,
  $turns: atom(turns),
  $live: atom(null),
  $echo: atom(null),
});

const terminal = (id, seated) => ({
  id,
  label: null,
  $thread: atom(seated),
  $buffer: atom(null),
  get buffer() {
    return this.$buffer.get();
  },
});

export const world = () => {
  const accessed = [];
  const dispatched = [];
  const lighthouse = {
    $user: atom({ id: "u1", username: "beef" }),
    $status: atom({ code: "VERIFIED" }),
    $isAuthorized: atom(true),
    get isAuthorized() {
      return this.$isAuthorized.get();
    },
    manifest: { type: "lighthouse", slug: "lighthouse", traits: ["JOINABLE"] },
    implements(name) {
      return this.manifest !== null && this.manifest.traits.includes(name);
    },
    login: (username, password) => accessed.push({ route: "/lighthouse/login", username, password }),
    signup: (username, password) => accessed.push({ route: "/lighthouse/signup", username, password }),
  };
  const host = (type, slug, code) => ({
    slug,
    manifest: null,
    reference: { absolute: `/${type}/${slug}` },
    $status: atom({ code }),
    $modes: atom([]),
    get modes() {
      return this.$modes.get();
    },
  });
  const core = host("runtime", "core", "HEALTHY");
  const daemon = host("daemon", "education", "MOUNTING");
  const entities = {
    daemon: { $entities: atom([daemon]) },
    mode: { $entities: atom([]) },
    thread: { $entities: atom([]) },
    terminal: { $entities: atom([]) },
  };
  const runtime = new Runtime({ manifest: { slug: "core" }, lighthouse, entities, daemon: core, $status: core.$status });
  const mode = (id, slug, traits, held) => ({
    id,
    slug,
    traits,
    daemon: held === core ? null : held,
    host: held,
    runtime,
    reference: { absolute: `${held.reference.absolute}/mode/chat/${slug}` },
  });
  const greeter = mode("m1", "greeter", ["HARNESSED"], core);
  const drill = mode("m2", "drill", ["HARNESSED"], daemon);
  const notes = mode("m3", "notes", ["APPLICATION", "HARNESSED"], daemon);
  daemon.$modes.set([drill, notes]);
  core.$modes.set([greeter]);
  entities.mode.$entities.set([greeter, drill, notes]);
  const hello = thread("t1", "hello thread", greeter, [
    turn("user", "first question"),
    turn("assistant", "first answer"),
    turn("user", "second question"),
  ]);
  const quiz = thread("t2", "", drill, []);
  entities.thread.$entities.set([hello, quiz]);
  const seated = terminal("k1", hello);
  const spare = terminal("k2", null);
  entities.terminal.$entities.set([seated, spare]);
  const buffer = { id: "b1", $bundle: atom(null), mode: null, $data: atom({ lemma: "essere", forms: ["sono", "sei"] }) };
  const client = {
    mask: { manifest: { slug: "hello-world" } },
    runtime,
    terminals: {
      $active: atom(seated),
      $entities: computed(entities.terminal.$entities, (rows) => rows),
      get active() {
        return this.$active.get();
      },
    },
    dispatch: (line) => dispatched.push(line),
  };
  return {
    client,
    accessed,
    dispatched,
    lighthouse,
    modes: { greeter, drill, notes },
    threads: { hello, quiz },
    terminals: { seated, spare },
    hosts: { runtime: core, daemon },
    buffer,
    turn,
  };
};

export const settle = async (setup, passes = 4) => {
  for (let pass = 0; pass < passes; pass++) {
    await setup.renderOnce();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};

export const screen = (options) => testRender(() => [], { width: 100, height: 30, ...options });

export const layout = (panes, extra = {}) => ({
  panes,
  buffer: false,
  dock: { side: "right", vertical: true, share: 0.32, direction: "row", dimension: 100, size: 32, full: false },
  ...extra,
});

export const SPLIT = { screenMode: "split-footer", externalOutputMode: "capture-stdout", footerHeight: 12, height: 24, width: 80 };
