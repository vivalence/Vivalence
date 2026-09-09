import { specimen, Vector } from "@vivalence/typology";
import { EMITTER } from "@vivalence/runtime/daemon/traits";
import { emitter } from "../page/index.js";

const SOURCE = `<script>
  let { buffer, terminal } = $props();
</script>

<article class="page"><h1>{buffer.data.title}</h1></article>

<style>
  .page { height: 100%; overflow-y: auto; }
</style>`;

// BufferRepository.create reproduced without the ORM — and reproduced FAITHFULLY, including
// the bind, because a stub that ignores `thread` could not fail P-nodoublebind no matter what
// the emitter passed. This stub is the only thing standing between the test and a silently
// double-advanced counter.
const rig = () => {
  const row = {
    id: "thread-1",
    counter: 0,
    bindBuffer(buffer) {
      buffer.thread = this;
      buffer.index = this.counter++;
      return buffer;
    },
  };
  const threads = { findOne: async () => row };
  const mode = {
    manifest: { slug: "hello-world", type: "demo" },
    module: { emitter },
    aperture: new Vector(),
    entity: { id: "mode-1" },
    generator: {
      bundle: async ({ kind, source }) => ({
        kind,
        hash: `h${source.length.toString(16).padStart(15, "0")}`,
        json: { entries: ["index.js"], type: "svelte" },
      }),
    },
  };
  const daemon = {
    entities: {
      thread: threads,
      em: { flush: async () => {} },
      buffer: {
        create: async ({ thread: bind, ...fields }) => {
          const buffer = { ...fields, thread: null, index: 0 };
          if (bind) (await threads.findOne(bind)).bindBuffer(buffer);
          return buffer;
        },
      },
    },
  };
  return { row, mode, daemon };
};

const arm = async (rigged) => {
  const finalize = await EMITTER(rigged.mode, rigged.daemon);
  finalize();
  return rigged.mode.emit;
};

specimen.describe(
  "P-nodoublebind: one drawn page advances thread.counter by exactly one",
  () => {
    specimen.it("mints one buffer and binds it once", async () => {
      const rigged = rig();
      const emit = await arm(rigged);

      const yielded = await emit.article({
        source: SOURCE,
        data: { title: "Flamingo" },
        thread: "thread-1",
      });

      specimen.expect(yielded.condition).toBe("NOMINAL");
      specimen.expect(yielded.output.buffer.length).toBe(1);

      const [buffer] = yielded.output.buffer;
      specimen.expect(buffer.thread).toBe(rigged.row);
      specimen.expect(buffer.index).toBe(0);
      // THE assertion. Two lines bind — generative.js:39-40 and emitter.js:80-81 — and this
      // mode declares both traits. The emitter mints thread-free so only one of them fires.
      specimen.expect(rigged.row.counter).toBe(1);
    });

    specimen.it("a second draw takes the next index, never a gap", async () => {
      const rigged = rig();
      const emit = await arm(rigged);

      for (const title of ["one", "two", "three"]) {
        await emit.article({
          source: SOURCE,
          label: { name: title },
          data: { title },
          thread: "thread-1",
        });
      }
      specimen.expect(rigged.row.counter).toBe(3);
    });

    specimen.it(
      "a standalone draw binds nothing and leaves the counter alone",
      async () => {
        const rigged = rig();
        const emit = await arm(rigged);

        const yielded = await emit.article({
          source: SOURCE,
          label: { name: "loose" },
          data: { title: "loose" },
        });
        const [buffer] = yielded.output.buffer;

        specimen.expect(buffer.thread).toBe(null);
        specimen.expect(rigged.row.counter).toBe(0);
      },
    );

    specimen.it(
      "carries the data through to the buffer unchanged",
      async () => {
        const rigged = rig();
        const emit = await arm(rigged);

        const data = {
          title: "Flamingo",
          sources: [{ title: "About", url: "https://x" }],
        };
        const yielded = await emit.article({
          source: SOURCE,
          label: { name: "Marginalia" },
          data,
          thread: "thread-1",
        });

        specimen.expect(yielded.output.buffer[0].data).toEqual(data);
      },
    );

    specimen.it(
      "refuses a URL import at the mint, before anything is bundled",
      async () => {
        const rigged = rig();
        const emit = await arm(rigged);

        let message = "";
        try {
          await emit.article({
            source:
              `<script>import z from "https://esm.sh/zod";</script><article class="page"/>`,
            thread: "thread-1",
          });
        } catch (error) {
          message = error.message;
        }
        specimen.expect(message).toContain("may not import from a URL");
        specimen.expect(rigged.row.counter).toBe(0);
      },
    );
  },
);
