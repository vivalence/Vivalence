import { Cortex, soma, Vector } from "@vivalence/typology";
import { EMITTER, GENERATIVE, HARNESSED } from "@vivalence/runtime/daemon/traits";
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

// the bundler without esbuild; the trait's tools read ctx.mode.generator at call time, so the
// real tools ride these stubs. the mint is the daemon's buffer repository, stubbed below with
// the bind INCLUDED — see emitter.test.js for why.
const capability = () => ({
  bundle: async ({ kind, source }) => ({
    kind,
    hash: `h${source.length.toString(16).padStart(15, "0")}`,
    json: { entries: ["index.js"], type: "svelte" },
  }),
  inspect: async (hash) => ({ hash, source: SOURCE }),
  serve: async () => null,
});

export const rig = async (script) => {
  const row = {
    id: "thread-1",
    counter: 0,
    traits: [],
    trait: {},
    bindBuffer(buffer) {
      buffer.thread = this;
      buffer.index = this.counter++;
      return buffer;
    },
  };
  const threads = { findOne: async () => row };
  const scripted = faculty(script);
  const daemon = {
    cortex: new Cortex().register([scripted.faculty]),
    entities: {
      thread: threads,
      turn: {
        history: async () => [],
        chain: async (turn) => ({ id: "turn-1", ...turn }),
      },
      em: { flush: async () => {}, fork: () => ({ create: () => null, flush: async () => {}, clear: () => {}, getReference: () => null }) },
      buffer: {
        create: async ({ thread: bind, ...fields }) => {
          const buffer = { ...fields, thread: null, index: 0 };
          if (bind) (await threads.findOne(bind)).bindBuffer(buffer);
          return buffer;
        },
      },
    },
    services: {},
    mountpoint: { absolute: "/nonexistent/rig" },
  };
  const mode = {
    manifest: { slug: "hello-world", type: "demo" },
    module: { emitter, generator },
    aperture: new Vector(),
    entity: { id: "mode-1" },
    tools: new Vector().slurp(web),
  };
  (await EMITTER(mode, daemon))();
  await GENERATIVE(mode, daemon);
  Object.assign(mode.generator, capability());
  (await HARNESSED(mode, daemon))();
  return { row, daemon, mode, seen: scripted.seen };
};
