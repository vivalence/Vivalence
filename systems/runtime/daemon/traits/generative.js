import paladin from "@vivalence/paladin";
import { v, Vector } from "@vivalence/typology";

export const GENERATIVE = async (mode, daemon) => {
  if (!daemon.mountpoint) {
    throw new Error("GENERATIVE: daemon carries no mountpoint");
  }
  const bundler = paladin.bundler(
    `${daemon.mountpoint.absolute}/bundles/${mode.manifest.type}/${mode.manifest.slug}`,
  );

  mode.generator = {
    bundle: bundler.bundle,
    inspect: bundler.inspect,
    serve: bundler.serve,
    tools: tools(),
  };

  if (mode.module.generator) mode.generator.tools.slurp(mode.module.generator);
};

const SOURCE = v
  .string()
  .desc(
    "A COMPLETE Svelte 5 component, exactly as it would sit in a .svelte file — runes only, the " +
      "payload at buffer.data, a scoped <style>, the root fills and scrolls. No fences, no prose. " +
      'Example: "<script>\\n  let { buffer, terminal } = $props();\\n</script>\\n\\n' +
      '<article class=\\"page\\"><h1>{buffer.data.title}</h1><p>{buffer.data.summary}</p></article>\\n\\n' +
      '<style>\\n  .page { height: 100%; overflow-y: auto; }\\n</style>"',
  );

const DATA = v
  .any()
  .desc(
    "The payload the component reads at buffer.data — whatever the source destructures. " +
      'Example: { title: "Flamingo", summary: "Six species on four continents.", ' +
      'sources: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Flamingo" }] }',
  )
  .optional();

const LABEL = v.primitives.Label.desc(
  "The name and one-line description the operator reads on the buffer's line in the chat " +
    'and in the buffer list. Example: { name: "Flamingo", description: "Six species, range and diet" }',
);

const named = (row) => `"${row.trait?.LABELED?.name ?? `buffer ${row.index}`}"`;

const refused = (verb, error) => ({
  condition: "ERROR",
  message:
    `${verb} refused: ${error.message}. The source is the problem — fix it and ${verb} again, do not retry it unchanged.`,
});

const failed = (verb, error) => ({
  condition: "ERROR",
  message:
    `${verb} failed: ${error.message}. Not the source — the runtime could not ${verb} this buffer. Say so to the operator; do not retry.`,
});

const tools = () => {
  const root = new Vector();
  const view = root.branch("/view");

  view.open(
    {
      nature: "/render",
      valence:
        "Draw a page: the component is compiled, content-addressed and mounted on the operator's " +
        "screen, and appears in the chat as a line they can click open. Returns the buffer row — " +
        "its id and its view.hash: generator_view_revise iterates the SAME buffer by id, " +
        "generator_view_inspect reads the source back by hash. Identical source is the same view; " +
        "it costs nothing to redraw.",
      input: v.object({ source: SOURCE, label: LABEL, data: DATA }),
    },
    async (ctx) => {
      let view;
      try {
        view = await ctx.mode.generator.bundle({
          kind: "svelte",
          source: ctx.input.source,
        });
      } catch (error) {
        return refused("render", error);
      }
      try {
        const buffer = await ctx.daemon.entities.buffer.create({
          mode: ctx.mode.entity.id,
          view: view.json,
          data: ctx.input.data ?? {},
          traits: ["LABELED"],
          trait: { LABELED: ctx.input.label },
          thread: ctx.thread ?? null,
        });
        await ctx.daemon.entities.em.flush();
        return { message: `drew ${named(buffer)}`, buffer: [buffer] };
      } catch (error) {
        return failed("render", error);
      }
    },
  );

  view.open(
    {
      nature: "/revise",
      valence:
        "Iterate a page you already drew: the SAME buffer, on the same clickable line, gets new " +
        "source and/or new data. The operator's screen re-mounts in place. Pass the buffer id " +
        "from generator_view_render or generator_view_list — not the hash. Use " +
        "generator_view_inspect first if you no longer have the source; revise from it rather " +
        "than rewriting.",
      input: v.object({
        buffer: v
          .string()
          .desc(
            "The buffer id generator_view_render or generator_view_list reported. " +
              'Example: "01a0856f-425f-72b8-b36f-decc1bb2050e"',
          ),
        source: SOURCE.optional(),
        label: LABEL.optional(),
        data: v
          .any()
          .desc(
            "Data keys to merge over buffer.data; keys you omit stay. " +
              'Example: { summary: "Six species on four continents." }',
          )
          .optional(),
      }),
    },
    async (ctx) => {
      const { buffer: id, source, label, data } = ctx.input;
      if (source === undefined && label === undefined && data === undefined) {
        return {
          condition: "ERROR",
          message:
            "revise needs a new source, a new label, new data, or some of each — nothing to change.",
        };
      }
      let view;
      try {
        view = source === undefined
          ? undefined
          : await ctx.mode.generator.bundle({ kind: "svelte", source });
      } catch (error) {
        return refused("revise", error);
      }
      try {
        const row = await ctx.daemon.entities.buffer.findOneOrFail({ id });
        if (view !== undefined) row.view = view.json;
        if (label !== undefined) row.trait = { ...row.trait, LABELED: label };
        if (data !== undefined) row.data = { ...row.data, ...data };
        await ctx.daemon.entities.em.flush();
        return { message: `revised ${named(row)}`, buffer: [row] };
      } catch (error) {
        return failed("revise", error);
      }
    },
  );

  view.open(
    {
      nature: "/inspect",
      valence:
        "Read back the exact source of a view by its hash, so you can revise it instead of " +
        "rewriting it. The 16-character prefix is enough.",
      input: v.object({
        hash: v
          .string()
          .desc(
            "The view hash generator_view_render, generator_view_revise or generator_view_list " +
              "reported; the 16-character " +
              'prefix is enough. Example: "d812d293b81efa7e"',
          ),
      }),
    },
    async (ctx) => {
      try {
        return await ctx.mode.generator.inspect(ctx.input.hash);
      } catch (error) {
        const compiled = await ctx.mode.generator.serve(
          `/${ctx.input.hash.slice(0, 16)}.svelte.mjs`,
        );
        return {
          condition: "ERROR",
          message: compiled
            ? `view ${
              ctx.input.hash.slice(
                0,
                16,
              )
            } is compiled but its source was not kept — redraw it.`
            : error.message,
        };
      }
    },
  );

  view.open(
    {
      nature: "/list",
      valence:
        "The pages on this thread, in order — each row with its id, index, view.hash and label. " +
        "Use it to find the buffer to revise or the hash to inspect when you no longer have them.",
      input: v.object({}),
    },
    async (ctx) => {
      const where = ctx.thread
        ? { thread: ctx.thread }
        : { mode: ctx.mode.entity.id };
      const rows = await ctx.daemon.entities.buffer.find(where, {
        orderBy: { index: "asc" },
      });
      if (!rows.length) return { message: "no pages drawn yet." };
      return { message: `${rows.length} page${rows.length === 1 ? "" : "s"} on this thread`, buffer: rows };
    },
  );

  return root;
};
