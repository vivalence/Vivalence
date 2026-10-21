import { Controller, Cortex, Path, Span, soma, Vector, mime } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
const { EMITTER, GENERATIVE, HARNESSED } = traits.mode;
import { emitter, generator } from "../page/index.js";
import { web } from "../tools/web.js";

// the offline rig for the nested agent: a REAL cortex holding a fixture faculty, the REAL
// EMITTER trait, the REAL respond() loop — and a stub bundler, because that is the one thing
// that needs esbuild. the fixture faculty is scripted turn by turn; everything between the
// turns (dispatch, the mint, the bind, the fold) is the machinery under test.

export const SOURCE = `<script>
  let { buffer, terminal } = $props();
</script>

<article class="page"><h1>{buffer.data.title}</h1></article>

<style>
  .page { height: 100%; overflow-y: auto; }
</style>`;

export const calling = (name, input, id = `call-${name}`) => ({
  role: "assistant",
  parts: [{ type: "tool_use", id, name, input }],
  meta: { state: "tools" },
});

export const saying = (text) => ({
  role: "assistant",
  parts: [{ type: "text", text }],
  meta: { state: "complete" },
});

// a draw is two calls: the view, then the buffer pinned to it
export const DRAW = calling("view_create", { slug: "flamingo", mime: mime.dom.svelte, source: SOURCE });
export const PAGE = calling("buffer_create", { mime: mime.json, label: { name: "Flamingo" }, data: { title: "Flamingo" }, views: ["flamingo"] });
export const PEEK = calling("view_read", { slug: "flamingo" });

// a faculty that plays a script: turn N of the script answers round N. `seen` keeps every
// request the faculty was handed — the inner catalog and system bag are read off it.
export const faculty = (script) => {
  const seen = [];
  return {
    seen,
    faculty: {
      type: "dialogue",
      tune: [0.5, 0.5, 0.5],
      via: {
        stream: async function* (request) {
          seen.push(request);
          const turn = script[seen.length - 1] ?? script.at(-1);
          if (turn instanceof Error) throw turn;
          yield* soma.drain(turn);
        },
      },
    },
  };
};

// the View rows without esbuild: the trait's bundle verb is replaced by an upsert into a plain
// list, and the view repository reads that same list. the mint is the daemon's buffer repository,
// stubbed below with the bind INCLUDED — see emitter.test.js for why.
export const views = () => {
  const rows = [];
  const row = (slug, type) => ({ id: `view-${slug}`, slug, mime: type, entry: "bundle/stub.mjs", files: { getItems: () => [], loadItems: async () => [] } });
  return {
    rows,
    bundle: async ({ slug, mime: type, source }) => {
      if (!source.trim()) throw new Error("bundle: source is empty");
      const held = rows.find((view) => view.slug === slug && view.mime === type) ?? (rows.push(row(slug, type)), rows.at(-1));
      held.source = source;
      return held;
    },
    find: async ({ slug }) => rows.filter((view) => slug === undefined || slug.$in.includes(view.slug)),
    findOneOrFail: async ({ slug }) => {
      const held = rows.find((view) => view.slug === slug);
      if (!held) throw new Error(`View not found (${slug})`);
      return held;
    },
  };
};

export const rig = async (script) => {
  const row = {
    id: "thread-1",
    counter: 0,
    phase: "CONVERSATION",
    traits: [],
    trait: {},
    user: { id: "user-1" },
    bindBuffer(buffer) {
      buffer.thread = this;
      buffer.index = this.counter++;
      return buffer;
    },
  };
  const threads = { findOne: async () => row, findOneOrFail: async () => row };
  const scripted = faculty(script);
  const held = views();
  const daemon = {
    type: "daemon",
    cortex: new Cortex().register([scripted.faculty]),
    entities: {
      thread: threads,
      // the harness stamps the dock's turn id onto the row after chaining, so the stub takes the patch too.
      activity: {
        control: async () => ({ id: "activity-1", controller: new Controller({ stdout: new Span("hallucination") }) }),
        updateOne: async () => null,
      },
      turn: {
        history: async () => [],
        chain: async (turn) => ({ id: "turn-1", ...turn }),
      },
      em: { flush: async () => {}, fork: () => ({ create: () => null, flush: async () => {}, clear: () => {}, getReference: () => null }) },
      view: held,
      buffer: {
        find: async () => [],
        create: async ({ thread: bind, ...fields }) => {
          const buffer = { ...fields, thread: null, index: 0, files: { add() {} } };
          if (bind) (await threads.findOne(bind)).bindBuffer(buffer);
          return buffer;
        },
      },
    },
    providers: {},
    mountpoint: { absolute: "/nonexistent/rig" },
    reference: new Path("/daemon/hello"),
  };
  const mode = {
    manifest: { slug: "hello-world", type: "demo" },
    module: { emitter, generator },
    mountpoint: "/nonexistent/rig",
    aperture: new Vector(),
    entity: { id: "mode-1" },
    tools: new Vector().graft(web),
    implements: () => false,
  };
  daemon.modes = { [mode.manifest.type]: { [mode.manifest.slug]: mode } };
  (await EMITTER(mode, daemon))();
  await GENERATIVE(mode, daemon);
  mode.generator.bundle = held.bundle;
  (await HARNESSED(mode, daemon))();
  return { row, daemon, mode, seen: scripted.seen, views: held.rows };
};
