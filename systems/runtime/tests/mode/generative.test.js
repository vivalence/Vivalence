import {
  Aperture,
  fromm,
  Mode,
  Path,
  shard,
  specimen,
  steer,
  ToolCall,
  Vector,
} from "@vivalence/typology";
import { GENERATIVE } from "@vivalence/runtime/daemon/traits";

const SOURCE =
  "<script>let { buffer } = $props();</script><h1>{buffer.data.title}</h1>";

function buildMode({ generator, slug = "gen-test" } = {}) {
  const mode = new Mode({
    manifest: { type: "chaosmonkey", slug, traits: ["GENERATIVE"] },
  });
  mode.aperture = new Aperture();
  mode.mount = new Path(`/mode/chaosmonkey/${slug}`);
  mode.entity = { id: "mode-1" };
  mode.tools = new Vector();
  if (generator) mode.module.generator = generator;
  return mode;
}

// the ORM as far as the tools reach it: buffer.create (the repository mint, bind included),
// flush, findOneOrFail, find. every row is a plain object.
function buildDaemon(directory) {
  const rows = [];
  const thread = {
    id: "thread-1",
    counter: 0,
    bindBuffer(buffer) {
      buffer.thread = this;
      buffer.index = this.counter++;
      return buffer;
    },
  };
  return {
    rows,
    thread,
    mountpoint: { absolute: directory },
    entities: {
      em: { flush: async () => {} },
      buffer: {
        create: async ({ thread: bind, ...fields }) => {
          const row = { id: `buffer-${rows.length + 1}`, thread: null, index: 0, ...fields };
          if (bind) thread.bindBuffer(row);
          rows.push(row);
          return row;
        },
        findOneOrFail: async ({ id }) => {
          const row = rows.find((row) => row.id === id);
          if (!row) throw new Error(`Buffer not found (${id})`);
          return row;
        },
        find: async () => rows,
      },
    },
  };
}

// a bundler that never touches esbuild: the hash is the source length.
const stub = (mode) => {
  mode.generator.bundle = async ({ source }) => {
    if (!source.trim()) throw new Error("bundle: source is empty");
    const hash = `h${source.length.toString(16).padStart(63, "0")}`;
    return {
      hash,
      json: { kind: "svelte", hash, mount: `/${hash.slice(0, 16)}.svelte.mjs` },
    };
  };
  mode.generator.inspect = async (hash) =>
    hash.startsWith("h")
      ? { hash, source: SOURCE }
      : Promise.reject(new Error(`bundler.inspect: unknown view: ${hash}`));
  mode.generator.serve = async () => null;
};

// mirrors harnessed.js: the trait speaks /view, the ARMING namespaces it under /generator.
const armed = (mode, daemon, thread = "thread-1") => {
  const vector = new Vector();
  vector.branch("/generator").slurp(mode.generator.tools);
  vector.use(shard.context.bind("daemon", daemon));
  vector.use(shard.context.bind("mode", mode));
  if (thread) vector.use(shard.context.bind("thread", thread));
  return vector;
};

const names = (vector) =>
  steer.trie.rollup(vector, () => null).map((entry) =>
    new ToolCall(entry.steps).name
  );

const invoke = async (vector, name, input) =>
  fromm.yield(
    await steer.dispatch.invoke(
      vector,
      new ToolCall(name).signal,
      steer.strategy.guarded,
    )(input),
  );

let directory;

specimen.describe("GENERATIVE — the capability and its tools", {
  sanitizeResources: false,
  sanitizeOps: false,
}, () => {
  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "generative-" });
  });
  specimen.afterAll(async () => {
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it(
    "mode.generator carries the four primitives and the tools; mode.tools is untouched",
    async () => {
      const mode = buildMode({ slug: "bare" });
      await GENERATIVE(mode, buildDaemon(directory));

      for (const key of ["bundle", "inspect", "serve"]) {
        specimen.expect(typeof mode.generator[key]).toBe("function");
      }
      specimen.expect(names(mode.generator.tools)).toEqual([
        "view_render",
        "view_revise",
        "view_inspect",
        "view_list",
      ]);
      specimen.expect(names(mode.tools)).toEqual([]);
      specimen.expect(mode.gen).toBe(undefined);
      specimen.expect(mode.generator.buffer).toBe(undefined);
    },
  );

  specimen.it(
    "render mints a bound row and returns it — the row speaks on the wire, the prose names it",
    async () => {
      const mode = buildMode({ slug: "render" });
      const daemon = buildDaemon(directory);
      await GENERATIVE(mode, daemon);
      stub(mode);

      const { condition, output } = await invoke(
        armed(mode, daemon),
        "generator_view_render",
        {
          source: SOURCE,
          label: { name: "Spawned", description: "a test page" },
          data: { title: "Spawned" },
        },
      );
      specimen.expect(condition).toBe("NOMINAL");
      specimen.expect(output.buffer).toHaveLength(1);
      const [row] = output.buffer;
      specimen.expect(row.traits).toEqual(["LABELED"]);
      specimen.expect(row.trait.LABELED).toEqual({
        name: "Spawned",
        description: "a test page",
      });
      specimen.expect(row.thread).toBe(daemon.thread);
      specimen.expect(row.index).toBe(0);
      specimen.expect(daemon.thread.counter).toBe(1);
      specimen.expect(output.message).toBe('drew "Spawned"');
      specimen.expect(shard.hallucinate.speak(output)).toBe(
        'drew "Spawned"\n' + JSON.stringify({
          buffer: [{ id: row.id, index: 0, mode: "mode-1", thread: "thread-1", traits: ["LABELED"], trait: { LABELED: { name: "Spawned", description: "a test page" } }, view: { hash: row.view.hash } }],
        }),
      );
    },
  );

  specimen.it(
    "revise keeps the SEAT — same id, same index, counter unmoved — swaps the view, replaces the label whole",
    async () => {
      const mode = buildMode({ slug: "revise" });
      const daemon = buildDaemon(directory);
      await GENERATIVE(mode, daemon);
      stub(mode);
      const vector = armed(mode, daemon);

      const drawn = await invoke(vector, "generator_view_render", {
        source: SOURCE,
        label: { name: "v1", description: "first" },
        data: { title: "v1" },
      });
      const [row] = drawn.output.buffer;
      const before = row.view.hash;

      const revised = await invoke(vector, "generator_view_revise", {
        buffer: row.id,
        source: SOURCE + "\n<!-- v2 -->",
        label: { name: "v2" },
        data: { title: "v2" },
      });
      specimen.expect(revised.condition).toBe("NOMINAL");
      specimen.expect(revised.output.buffer[0]).toBe(row);
      specimen.expect(row.index).toBe(0);
      specimen.expect(daemon.thread.counter).toBe(1);
      specimen.expect(row.view.hash).not.toBe(before);
      specimen.expect(row.data).toEqual({ title: "v2" });
      specimen.expect(row.trait.LABELED).toEqual({ name: "v2" });
      specimen.expect(revised.output.message).toContain('"v2"');
      specimen.expect(revised.output.message).toBe('revised "v2"');
      specimen.expect(daemon.rows).toHaveLength(1);
    },
  );

  specimen.it(
    "revise with data only leaves the view alone; with nothing it refuses",
    async () => {
      const mode = buildMode({ slug: "revise-data" });
      const daemon = buildDaemon(directory);
      await GENERATIVE(mode, daemon);
      stub(mode);
      const vector = armed(mode, daemon);

      const [row] = (await invoke(vector, "generator_view_render", {
        source: SOURCE,
        label: { name: "v1" },
        data: { title: "v1", n: 1 },
      })).output.buffer;
      const hash = row.view.hash;
      await invoke(vector, "generator_view_revise", { buffer: row.id, data: { n: 2 } });
      specimen.expect(row.view.hash).toBe(hash);
      specimen.expect(row.data).toEqual({ title: "v1", n: 2 });

      const empty = await invoke(vector, "generator_view_revise", { buffer: row.id });
      specimen.expect(empty.condition).toBe("ERROR");
      specimen.expect(empty.output.message).toContain("nothing to change");

      const missing = await invoke(vector, "generator_view_revise", {
        buffer: "buffer-9",
        data: {},
      });
      specimen.expect(missing.condition).toBe("ERROR");
      specimen.expect(missing.output.message).toContain("revise failed");
      specimen.expect(missing.output.message).toContain("Not the source");
    },
  );

  specimen.it(
    "list speaks every seat on the thread; inspect reads a source back or says why not",
    async () => {
      const mode = buildMode({ slug: "list" });
      const daemon = buildDaemon(directory);
      await GENERATIVE(mode, daemon);
      stub(mode);
      const vector = armed(mode, daemon);

      specimen.expect((await invoke(vector, "generator_view_list", {})).output.message)
        .toBe("no pages drawn yet.");
      await invoke(vector, "generator_view_render", {
        source: SOURCE,
        label: { name: "one" },
      });
      await invoke(vector, "generator_view_render", {
        source: SOURCE + " ",
        label: { name: "two" },
      });
      const listed = (await invoke(vector, "generator_view_list", {})).output;
      specimen.expect(listed.message).toBe("2 pages on this thread");
      specimen.expect(listed.buffer.map((row) => [row.index, row.trait.LABELED.name])).toEqual([[0, "one"], [1, "two"]]);

      const read = await invoke(vector, "generator_view_inspect", {
        hash: daemon.rows[0].view.hash,
      });
      specimen.expect(read.output.object.source).toBe(SOURCE);

      const unknown = await invoke(vector, "generator_view_inspect", {
        hash: "f".repeat(64),
      });
      specimen.expect(unknown.condition).toBe("ERROR");
      specimen.expect(unknown.output.message).toContain("unknown view");
    },
  );

  specimen.it(
    "render refuses an empty source with a message the model can act on",
    async () => {
      const mode = buildMode({ slug: "refuse" });
      const daemon = buildDaemon(directory);
      await GENERATIVE(mode, daemon);
      stub(mode);

      const refused = await invoke(armed(mode, daemon), "generator_view_render", {
        source: "   ",
        label: { name: "empty" },
      });
      specimen.expect(refused.condition).toBe("ERROR");
      specimen.expect(refused.output.message).toContain("render refused");
      specimen.expect(refused.output.message).toContain(
        "do not retry it unchanged",
      );
      specimen.expect(daemon.rows).toHaveLength(0);
    },
  );

  specimen.it(
    "a mode's generator STEERS: its middleware runs on the trait's door, its reword wins the pattern, the trait's effect stays",
    async () => {
      const seen = [];
      const generator = new Vector();
      generator.branch("/view").use(async (ctx, next) => {
        seen.push(ctx.input.source ?? null);
        if (ctx.input.source?.includes("https://")) {
          ctx.output = {
            condition: "ERROR",
            message: "refused: a drawn component may not import from a URL",
          };
          return;
        }
        await next();
      });
      generator.branch("/view").open({
        nature: "/render",
        valence: "HOUSE RULES apply. ".repeat(6),
      });

      const mode = buildMode({ generator, slug: "steered" });
      const daemon = buildDaemon(directory);
      await GENERATIVE(mode, daemon);
      stub(mode);
      const vector = armed(mode, daemon);

      specimen.expect(names(vector)).toEqual([
        "generator_view_render",
        "generator_view_revise",
        "generator_view_inspect",
        "generator_view_list",
      ]);
      const [render] = steer.trie.rollup(vector, () => null);
      specimen.expect(render.pattern.valence).toContain("HOUSE RULES");
      specimen.expect(render.pattern.input).toBe(undefined);

      const drawn = await invoke(vector, "generator_view_render", {
        source: SOURCE,
        label: { name: "steered" },
      });
      specimen.expect(drawn.output.buffer).toHaveLength(1);

      const refused = await invoke(vector, "generator_view_render", {
        source: `<script>import x from "https://esm.sh/x"</script>`,
        label: { name: "refused" },
      });
      specimen.expect(refused.condition).toBe("ERROR");
      specimen.expect(refused.output.message).toContain(
        "may not import from a URL",
      );
      specimen.expect(daemon.rows).toHaveLength(1);
      specimen.expect(seen).toEqual([
        SOURCE,
        `<script>import x from "https://esm.sh/x"</script>`,
      ]);
    },
  );
});
