import { Aperture, belt, contexts, fromm, mime, Mode, Path, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { FileRepository, traits } from "@vivalence/runtime";
const { SURFACING } = traits.mode;

const SOURCE =
  "<script>let { buffer } = $props();</script><h1>{buffer.data.title}</h1>";

function buildMode({ slug = "gen-test", directory } = {}) {
  const mode = new Mode({ module: {
    manifest: { type: "chaosmonkey", slug, traits: ["SURFACING"] },
  } });
  mode.aperture = new Aperture();
  mode.reference = new Path(`/mode/chaosmonkey/${slug}`);
  mode.mountpoint = `${directory}/mode_chaosmonkey_${slug}`;
  mode.entity = { id: "mode-1" };
  mode.tools = new Vector();
  return mode;
}

// the ORM as far as the tools reach it: buffer.create (the repository mint, bind included),
// flush, findOneOrFail, find on buffers; ensure on files, the real FileRepository.record over it; find · findOneOrFail on views. every row is a plain object.
function buildDaemon(directory) {
  const rows = [];
  const files = [];
  const surfaces = [];
  const thread = {
    id: "thread-1",
    counter: 0,
    bindBuffer(buffer) {
      buffer.thread = this;
      buffer.index = this.counter++;
      return buffer;
    },
  };
  const held = (surface) => ({ ...surface, files: { getItems: () => files.filter((file) => file.surface === surface.id), loadItems: async () => files.filter((file) => file.surface === surface.id) } });
  return {
    rows,
    files,
    surfaces,
    thread,
    mountpoint: { absolute: directory },
    entities: {
      em: { flush: async () => {} },
      buffer: {
        create: async ({ thread: bind, ...fields }) => {
          const row = { id: `buffer-${rows.length + 1}`, thread: null, index: 0, files: { held: [], add(file) { this.held.push(file); } }, ...fields };
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
      file: {
        ensure: async (data) => {
          const found = files.find((file) => file.mode === data.mode && file.path === data.path);
          if (found) return Object.assign(found, data);
          files.push({ id: `file-${files.length + 1}`, ...data });
          return files.at(-1);
        },
        em: { flush: async () => {} },
        record: FileRepository.prototype.record,
      },
      surface: {
        find: async ({ slug, mime: type }) => surfaces.filter((surface) => (slug === undefined || slug.$in.includes(surface.slug)) && (type === undefined || surface.mime === type)).map(held),
        findOneOrFail: async ({ slug, mime: type }) => {
          const surface = surfaces.find((surface) => surface.slug === slug && (type === undefined || surface.mime === type));
          if (!surface) throw new Error(`Surface not found (${slug})`);
          return held(surface);
        },
      },
    },
  };
}

// a bundler that never touches esbuild: the view row is upserted by (slug, mime), its hash is the source length.
const stub = (mode, daemon) => {
  mode.surface.bundle = async ({ slug, mime: type, source }) => {
    if (!source.trim()) throw new Error("bundle: source is empty");
    const hash = `h${source.length.toString(16).padStart(63, "0")}`;
    const found = daemon.surfaces.find((surface) => surface.slug === slug && surface.mime === type);
    const surface = found ?? { id: `view-${daemon.surfaces.length + 1}`, slug, mime: type, entry: "" };
    if (!found) daemon.surfaces.push(surface);
    surface.entry = `bundle/${hash.slice(-16)}.dom.svelte.mjs`;
    surface.hash = hash;
    return surface;
  };
};

// mirrors harnessed.js: the trait's tools are grafted whole onto the armed vector, no namespace.
const armed = (mode, daemon, thread = "thread-1") => {
  const vector = new Vector();
  vector.graft(mode.tools);
  vector.use(shard.context.spread(contexts.daemonDie, daemon));
  vector.use(shard.context.bind("mode", mode));
  if (thread) vector.use(shard.context.bind("thread", thread));
  return vector;
};

const names = (vector) =>
  steer.trie.leaves(vector).map((entry) =>
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

specimen.describe("SURFACING — the capability and its tools", {
  sanitizeResources: false,
  sanitizeOps: false,
}, () => {
  specimen.beforeAll(async () => {
    directory = await Deno.makeTempDir({ prefix: "surfacing-" });
  });
  specimen.afterAll(async () => {
    await Deno.remove(directory, { recursive: true });
  });

  specimen.it(
    "mode.surface carries the bundle verb; the five tools land on mode.tools",
    async () => {
      const mode = buildMode({ slug: "bare", directory });
      await SURFACING(mode, buildDaemon(directory));

      specimen.expect(typeof mode.surface.bundle).toBe("function");
      specimen.expect(names(mode.tools)).toEqual([
        "buffer_create",
        "surface_create",
        "surface_update",
        "surface_read",
        "surface_list",
      ]);
      specimen.expect(mode.surface.tools).toBe(undefined);
      specimen.expect(mode.surface.inspect).toBe(undefined);
      specimen.expect(mode.surface.serve).toBe(undefined);
      specimen.expect(mode.surface.buffer).toBe(undefined);
    },
  );

  specimen.it(
    "surface_create mints a Surface row through the bundler; the same slug and mime again rewrites the ONE row",
    async () => {
      const mode = buildMode({ slug: "surfaces", directory });
      const daemon = buildDaemon(directory);
      await SURFACING(mode, daemon);
      stub(mode, daemon);
      const vector = armed(mode, daemon);

      const first = await invoke(vector, "surface_create", { slug: "pulse", mime: mime.dom.svelte, source: SOURCE });
      specimen.expect(first.condition).toBe("NOMINAL");
      specimen.expect(first.product.message).toBe('wrote surface "pulse"');
      specimen.expect(first.product.surface).toEqual([{ id: "view-1", slug: "pulse", mime: mime.dom.svelte, entry: daemon.surfaces[0].entry }]);

      const again = await invoke(vector, "surface_create", { slug: "pulse", mime: mime.dom.svelte, source: SOURCE + " " });
      specimen.expect(again.product.surface[0].id).toBe("view-1");
      specimen.expect(again.product.surface[0].entry).not.toBe(first.product.surface[0].entry);
      specimen.expect(daemon.surfaces).toHaveLength(1);

      const tty = await invoke(vector, "surface_create", { slug: "pulse", mime: mime.tty.solid, source: SOURCE });
      specimen.expect(tty.product.surface[0].id).toBe("view-2");
      specimen.expect(daemon.surfaces).toHaveLength(2);
    },
  );

  specimen.it(
    "buffer_create mints a bound row — label, data, the surface pinned by slug — and the row speaks on the wire",
    async () => {
      const mode = buildMode({ slug: "open", directory });
      const daemon = buildDaemon(directory);
      await SURFACING(mode, daemon);
      stub(mode, daemon);
      const vector = armed(mode, daemon);
      await invoke(vector, "surface_create", { slug: "pulse", mime: mime.dom.svelte, source: SOURCE });

      const { condition, product } = await invoke(vector, "buffer_create", {
        mime: mime.json,
        label: { name: "Spawned", description: "a test page" },
        data: { title: "Spawned" },
        surfaces: ["pulse"],
      });
      specimen.expect(condition).toBe("NOMINAL");
      specimen.expect(product.buffer).toHaveLength(1);
      const [row] = product.buffer;
      specimen.expect(row.mime).toBe(mime.json);
      specimen.expect(row.surfaces).toEqual(["view-1"]);
      specimen.expect(row.traits).toEqual(["LABELED"]);
      specimen.expect(row.trait.LABELED).toEqual({ name: "Spawned", description: "a test page" });
      specimen.expect(row.thread).toBe(daemon.thread);
      specimen.expect(row.index).toBe(0);
      specimen.expect(daemon.thread.counter).toBe(1);
      specimen.expect(product.message).toBe('opened "Spawned"');
      const [line, json] = belt.hallucinate.speak(product).split("\n");
      specimen.expect(line).toBe('opened "Spawned"');
      specimen.expect(JSON.parse(json)).toEqual({
        buffer: [{ id: row.id, index: 0, mime: mime.json, mode: "mode-1", thread: "thread-1", traits: ["LABELED"], trait: { LABELED: { name: "Spawned", description: "a test page" } } }],
      });
    },
  );

  specimen.it(
    "buffer_create with a source writes a File under the mode's mountpoint and the buffer loads it; a turn binds the turn, not the thread",
    async () => {
      const mode = buildMode({ slug: "content", directory });
      const daemon = buildDaemon(directory);
      await SURFACING(mode, daemon);
      const vector = armed(mode, daemon);

      const { condition, product } = await invoke(vector, "buffer_create", { mime: mime.markdown, source: "# Q3\n\nRevenue …", turn: "turn-9" });
      specimen.expect(condition).toBe("NOMINAL");
      const [row] = product.buffer;
      specimen.expect(row.turns).toEqual(["turn-9"]);
      specimen.expect(row.thread).toBe(null);
      specimen.expect(daemon.thread.counter).toBe(0);
      specimen.expect(daemon.files).toHaveLength(1);
      const [file] = daemon.files;
      specimen.expect(file.path).toBe(`${row.id}.md`);
      specimen.expect(file.mime).toBe(mime.markdown);
      specimen.expect(file.mount).toBe(`${directory}/mode_chaosmonkey_content/${row.id}.md`);
      specimen.expect(file.integrity).toMatch(/^sha256-[0-9a-f]{64}$/);
      specimen.expect(file.bytes).toBe(new TextEncoder().encode("# Q3\n\nRevenue …").length);
      specimen.expect(await Deno.readTextFile(file.mount)).toBe("# Q3\n\nRevenue …");
      specimen.expect(row.files.held).toEqual([file]);
    },
  );

  specimen.it(
    "surface_update rewrites by slug, surface_read answers the row with its files, surface_list the mode's rows; a missing slug fails loud",
    async () => {
      const mode = buildMode({ slug: "list", directory });
      const daemon = buildDaemon(directory);
      await SURFACING(mode, daemon);
      stub(mode, daemon);
      const vector = armed(mode, daemon);

      specimen.expect((await invoke(vector, "surface_list", {})).product.message).toBe("no surfaces written yet.");
      await invoke(vector, "surface_create", { slug: "one", mime: mime.dom.svelte, source: SOURCE });
      await invoke(vector, "surface_create", { slug: "two", mime: mime.tty.solid, source: SOURCE + " " });
      const listed = (await invoke(vector, "surface_list", {})).product;
      specimen.expect(listed.message).toBe("2 surfaces on this mode");
      specimen.expect(listed.surface.map((row) => [row.slug, row.mime])).toEqual([["one", mime.dom.svelte], ["two", mime.tty.solid]]);
      specimen.expect((await invoke(vector, "surface_list", { mime: mime.tty.solid })).product.surface.map((row) => row.slug)).toEqual(["two"]);

      const before = daemon.surfaces[0].entry;
      const updated = await invoke(vector, "surface_update", { slug: "one", source: SOURCE + "  " });
      specimen.expect(updated.condition).toBe("NOMINAL");
      specimen.expect(updated.product.surface[0].id).toBe("view-1");
      specimen.expect(daemon.surfaces[0].entry).not.toBe(before);
      specimen.expect(daemon.surfaces).toHaveLength(2);

      const read = await invoke(vector, "surface_read", { slug: "one" });
      specimen.expect(read.condition).toBe("NOMINAL");
      specimen.expect(read.product.object).toEqual({ id: "view-1", slug: "one", mime: mime.dom.svelte, entry: daemon.surfaces[0].entry, files: [], source: null });

      const missing = await invoke(vector, "surface_update", { slug: "nine", source: SOURCE });
      specimen.expect(missing.condition).toBe("ERROR");
      specimen.expect(missing.product.message).toContain("surface_update failed");
      specimen.expect(missing.product.message).toContain("Not the source");
    },
  );

  specimen.it(
    "surface_create refuses an empty source with a message the model can act on",
    async () => {
      const mode = buildMode({ slug: "refuse", directory });
      const daemon = buildDaemon(directory);
      await SURFACING(mode, daemon);
      stub(mode, daemon);

      const refused = await invoke(armed(mode, daemon), "surface_create", { slug: "empty", mime: mime.dom.svelte, source: "   " });
      specimen.expect(refused.condition).toBe("ERROR");
      specimen.expect(refused.product.message).toContain("surface_create refused");
      specimen.expect(refused.product.message).toContain("do not retry it unchanged");
      specimen.expect(daemon.surfaces).toHaveLength(0);
    },
  );

  specimen.it(
    "a mode's tools STEER: grafted after the trait, its middleware runs, its reword wins, the trait's effect stays",
    async () => {
      const seen = [];
      const generator = new Vector();
      generator.branch("/surface").use(async (ctx, next) => {
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
      generator.branch("/surface").open({
        nature: "/create",
        valence: "HOUSE RULES apply. ".repeat(6),
      });

      const mode = buildMode({ slug: "steered", directory });
      const daemon = buildDaemon(directory);
      await SURFACING(mode, daemon);
      mode.tools.graft(generator);
      stub(mode, daemon);
      const vector = armed(mode, daemon);

      specimen.expect(names(vector)).toEqual([
        "buffer_create",
        "surface_create",
        "surface_update",
        "surface_read",
        "surface_list",
      ]);
      const [, create] = steer.trie.leaves(vector);
      specimen.expect(create.pattern.valence).toContain("HOUSE RULES");
      specimen.expect(Object.keys(create.pattern.input.properties)).toEqual(["slug", "mime", "source"]);

      const drawn = await invoke(vector, "surface_create", { slug: "steered", mime: mime.dom.svelte, source: SOURCE });
      specimen.expect(drawn.product.surface).toHaveLength(1);

      const refused = await invoke(vector, "surface_create", {
        slug: "refused",
        mime: mime.dom.svelte,
        source: `<script>import x from "https://esm.sh/x"</script>`,
      });
      specimen.expect(refused.condition).toBe("ERROR");
      specimen.expect(refused.product.message).toContain("may not import from a URL");
      specimen.expect(daemon.surfaces).toHaveLength(1);
      specimen.expect(seen).toEqual([
        SOURCE,
        `<script>import x from "https://esm.sh/x"</script>`,
      ]);
    },
  );
});
