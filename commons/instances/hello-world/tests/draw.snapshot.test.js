import { specimen, steer, Vector } from "@vivalence/typology";
import { EMITTER } from "@vivalence/runtime/daemon/traits";
import { machine } from "../tools/doctor.js";
import { harness } from "../harness.js";
import { emitter } from "../page/index.js";
import { pin } from "./harness.snapshot.test.js";

// the same FIXED record S0 uses — standing() reads paladin.instance, so a live one would put
// this machine in the file. Only the SIZE of the machine section is pinned here; S0 owns its text.
const STANDING = {
  instance: { slug: "hello-world" },
  daemon: {
    slug: "runtime",
    mountpoint: "/ledger/instances/hello-world/mountpoint",
  },
  entities: ["buffer", "thread", "turn"],
  modes: [
    {
      slug: "hello-world",
      traits: ["APPLICATION", "CONVERSATIONAL"],
      routes: ["/hello/doctor", "/hello/bot", "/hello/agent"],
    },
    { slug: "runtime", traits: [], routes: [] },
  ],
  faults: [],
};

// the REAL middleware chain, not a hand-composed object: section ORDER is what the root-use-
// before-branch-use law produces, and a hand-built literal could not get it wrong.
const assemble = async (path) => {
  const run = new Vector();
  run.use(async (ctx, next) => {
    ctx.hallucination = { system: {} };
    ctx.daemon = { mountpoint: null, entities: {}, flatmodes: () => [] };
    await next();
  });
  run.slurp(harness);
  run.branch("/dialogue").open("/render", (ctx) => ctx.hallucination.system);
  run.open("/render", (ctx) => ctx.hallucination.system);

  const system = await steer.dispatch.invoke(
    run,
    path,
    steer.strategy.guarded,
  )({});
  return { ...system, machine: machine(STANDING) };
};

const sections = (system) =>
  Object.entries(system).map(([key, text]) => [key, text.length]);

specimen.describe(
  "hello-world draw snapshot — the system bag once RENDER is in",
  () => {
    specimen.it(
      "S3: every section a drawing model sees, in order, with its size",
      async () => {
        const dialogue = await assemble("/dialogue/render");
        const object = await assemble("/render");
        pin(
          {
            dialogue: sections(dialogue),
            object: sections(object),
            // the vocabulary the house style teaches. a token added, renamed or dropped moves
            // this list, and style.tokens.test.js is what says whether dapper still emits it.
            tokens: [
              ...new Set(
                [...dialogue.render.matchAll(/--[a-z0-9-]+/g)].map(([token]) =>
                  token
                ),
              ),
            ].sort(),
          },
          "hello-world-draw.snapshot.json",
        );
      },
    );

    specimen.it(
      "S3: render rides the ROOT — an object call sees it, format stays on /dialogue",
      async () => {
        const object = await assemble("/render");
        specimen.expect(Object.keys(object).sort()).toEqual([
          "hello",
          "machine",
          "render",
        ]);
        const dialogue = await assemble("/dialogue/render");
        specimen.expect(Object.keys(dialogue).sort()).toEqual([
          "format",
          "hello",
          "machine",
          "render",
        ]);
      },
    );

    specimen.it("S3: the row one draw mints", async () => {
      const row = {
        id: "thread-1",
        counter: 0,
        bindBuffer(buffer) {
          buffer.thread = this;
          buffer.index = this.counter++;
          return buffer;
        },
      };
      const mode = {
        manifest: { slug: "hello-world", type: "demo" },
        module: { emitter },
        aperture: new Vector(),
        entity: { id: "mode-1" },
        generator: {
          // a stub bundler, because the real integrity hash moves with esbuild — the oracle-ask
          // timing collapse is the precedent. `view` is pinned as { entries, type } for the same
          // reason it would have to be collapsed against the real one.
          bundle: async () => ({
            json: { entries: ["index.js"], type: "svelte" },
          }),
        },
      };
      const daemon = {
        entities: {
          thread: { findOne: async () => row },
          em: { flush: async () => {} },
          buffer: {
            create: async ({ thread, ...fields }) => ({ ...fields, index: 0, thread: null }),
          },
        },
      };
      (await EMITTER(mode, daemon))();

      const yielded = await mode.emit.article({
        source:
          `<script>\n  let { buffer, terminal } = $props();\n</script>\n\n<article class="page"><h1>{buffer.data.title}</h1></article>`,
        label: { name: "Flamingo" },
        data: {
          title: "Flamingo",
          sources: [{ title: "Flamingo — Wikipedia", url: "https://en.wikipedia.org/wiki/Flamingo" }],
        },
        thread: "thread-1",
      });

      pin(
        {
          condition: yielded.condition,
          buffer: yielded.output.buffer.map(({ data, view, index }) => ({
            data,
            view,
            index,
          })),
          counter: row.counter,
        },
        "hello-world-mint.snapshot.json",
      );
    });
  },
);
