import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { mime, Path, v, Vector } from "@vivalence/typology";

const SLUG = v
  .string()
  .desc(
    'The surface\'s name inside this mode — one surface per (slug, mime); the same slug again rewrites it. Example: "pulse"',
  );

const SURFACE_MIME = mime
  .type()
  .desc(
    `What the code is: ${mime.dom.svelte} for a Svelte 5 component the browser mounts, ${mime.tty.solid} for a Solid component the terminal mounts. ` +
      `Example: "${mime.dom.svelte}"`,
  );

const SOURCE = v
  .string()
  .desc(
    "The COMPLETE component source, exactly as it would sit in its file — the payload at buffer.data, " +
      "the root fills and scrolls. No fences, no prose. " +
      'Example: "<script>\\n  let { buffer, terminal } = $props();\\n</script>\\n\\n' +
      '<article class=\\"page\\"><h1>{buffer.data.title}</h1></article>\\n\\n' +
      '<style>\\n  .page { height: 100%; overflow-y: auto; }\\n</style>"',
  );

const DATA = v
  .any()
  .desc(
    "The payload a surface reads at buffer.data — whatever the source destructures. " +
      'Example: { title: "Flamingo", summary: "Six species on four continents.", ' +
      'sources: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Flamingo" }] }',
  )
  .optional();

const LABEL = v.primitives.Label.desc(
  "The name and one-line description the operator reads on the buffer's entry in the chat " +
    'and in the buffer list. Example: { name: "Flamingo", description: "Six species, range and diet" }',
);

const named = (row) => `"${row.trait?.LABELED?.name ?? `buffer ${row.index}`}"`;

const refused = (tool, error) => ({
  condition: "ERROR",
  message: `${tool} refused: ${error.message}. The source is the problem — fix it and ${tool} again, do not retry it unchanged.`,
});

const failed = (tool, error) => ({
  condition: "ERROR",
  message: `${tool} failed: ${error.message}. Not the source — the runtime could not ${tool} this. Say so to the operator; do not retry.`,
});

const spoken = (surface) => ({ id: surface.id, slug: surface.slug, mime: surface.mime, entry: surface.entry });

const kept = async (surface) => {
  const files = await surface.files.loadItems();
  return (
    files.find((file) => file.mime === surface.mime) ?? files.find((file) => file.path === surface.entry)
  );
};

export const surfacing = new Vector();

surfacing.open(
  {
    nature: "/buffer/create",
    valence:
      "Open a buffer on the operator's screen: a working area with a mime, live data, and the files it loads. " +
      "Pass `data` for a state the mode's surfaces render, or `source` for content (markdown, org, html) the " +
      "client renders by mime — a source becomes a File this mode holds. `surfaces` pins this mode's surfaces by " +
      "slug so the buffer shows them instead of the mode's default; `turn` hangs the buffer under that turn. " +
      "Returns the buffer row — its id is what buffer_update and buffer_label take.",
    input: v.object({
      mime: mime
        .type()
        .desc(
          'What the buffer IS — the kind the client picks a renderer by. Example: "text/markdown"',
        ),
      data: DATA,
      source: v
        .string()
        .optional()
        .desc(
          'Content bytes for a content buffer, written as a File. Example: "# Q3\\n\\nRevenue …"',
        ),
      turn: v
        .string()
        .optional()
        .desc(
          'The turn the buffer surfaces under. Example: "01a0856f-425f-72b8-b36f-decc1bb2050e"',
        ),
      label: LABEL.optional(),
      surfaces: v
        .array(SLUG)
        .optional()
        .desc('Slugs of this mode\'s surfaces to pin on the buffer. Example: ["pulse"]'),
    }),
  },
  async (ctx) => {
    try {
      const surfaces =
        ctx.input.surfaces === undefined
          ? {}
          : {
              surfaces: (
                await ctx.entities.surface.find({
                  mode: ctx.mode.entity.id,
                  slug: { $in: ctx.input.surfaces },
                })
              ).map((surface) => surface.id),
            };
      const buffer = await ctx.entities.buffer.create({
        mode: ctx.mode.entity.id,
        mime: ctx.input.mime,
        ...(ctx.input.data !== undefined && { data: ctx.input.data }),
        ...(ctx.input.turn === undefined
          ? { thread: ctx.thread ?? null }
          : { turns: [ctx.input.turn] }),
        ...(ctx.input.label !== undefined && {
          traits: ["LABELED"],
          trait: { LABELED: ctx.input.label },
        }),
        ...surfaces,
      });
      await ctx.entities.em.flush();
      if (ctx.input.source !== undefined) {
        const path = `${buffer.id}.${mime.extension(ctx.input.mime)}`;
        const mount = join(new Path(ctx.mode.mountpoint).absolute, path);
        const bytes = new TextEncoder().encode(ctx.input.source);
        await paladin.state.store(mount, bytes);
        buffer.files.add(
          await ctx.entities.file.record({
            mode: ctx.mode.entity.id,
            path,
            mount,
            mime: ctx.input.mime,
            bytes,
          }),
        );
      }
      await ctx.entities.em.flush();
      return { message: `opened ${named(buffer)}`, buffer: [buffer] };
    } catch (error) {
      return failed("buffer_create", error);
    }
  },
);

const surface = surfacing.branch("/surface");

surface.open(
  {
    nature: "/create",
    valence:
      "Write a surface: code this mode ships to present a buffer. The source is compiled, content-addressed and " +
      "stored as this mode's Files; the row names the entry the client imports. A buffer of this mode shows " +
      "it once pinned (buffer_create `surfaces`) or when it is the mode's only surface. The same slug and mime again " +
      "rewrites the surface where it is stored — surface_update does the same by slug. Returns the surface row.",
    input: v.object({ slug: SLUG, mime: SURFACE_MIME, source: SOURCE }),
  },
  async (ctx) => {
    let row;
    try {
      row = await ctx.mode.surface.bundle({
        slug: ctx.input.slug,
        mime: ctx.input.mime,
        source: ctx.input.source,
      });
    } catch (error) {
      return refused("surface_create", error);
    }
    return { message: `wrote surface "${row.slug}"`, surface: [spoken(row)] };
  },
);

surface.open(
  {
    nature: "/update",
    valence:
      "Rewrite a surface you already wrote: the SAME row, by slug, gets new source; its Files are rebuilt where they are stored " +
      "and every buffer showing it re-mounts. Use surface_read first if you no longer have the source; revise " +
      "from it rather than rewriting.",
    input: v.object({
      slug: SLUG,
      mime: SURFACE_MIME.optional().desc(
        "Which of the slug's rows when it has one per mime; the only one when left out.",
      ),
      source: SOURCE,
    }),
  },
  async (ctx) => {
    let held;
    try {
      held = await ctx.entities.surface.findOneOrFail({
        mode: ctx.mode.entity.id,
        slug: ctx.input.slug,
        ...(ctx.input.mime !== undefined && { mime: ctx.input.mime }),
      });
    } catch (error) {
      return failed("surface_update", error);
    }
    let row;
    try {
      row = await ctx.mode.surface.bundle({
        slug: held.slug,
        mime: held.mime,
        source: ctx.input.source,
      });
    } catch (error) {
      return refused("surface_update", error);
    }
    return { message: `rewrote surface "${row.slug}"`, surface: [spoken(row)] };
  },
);

surface.open(
  {
    nature: "/read",
    valence:
      "Read a surface back by slug: the row, its Files, and the source you wrote, so you can surface_update it " +
      "instead of rewriting it from memory.",
    input: v.object({
      slug: SLUG,
      mime: SURFACE_MIME.optional().desc(
        "Which of the slug's rows when it has one per mime; the only one when left out.",
      ),
    }),
  },
  async (ctx) => {
    try {
      const held = await ctx.entities.surface.findOneOrFail(
        {
          mode: ctx.mode.entity.id,
          slug: ctx.input.slug,
          ...(ctx.input.mime !== undefined && { mime: ctx.input.mime }),
        },
        { populate: ["files"] },
      );
      const file = await kept(held);
      return {
        ...spoken(held),
        files: held.files
          .getItems()
          .map((out) => ({ id: out.id, path: out.path, mime: out.mime, bytes: out.bytes })),
        source: file === undefined ? null : await paladin.read.text(file.mount),
      };
    } catch (error) {
      return failed("surface_read", error);
    }
  },
);

surface.open(
  {
    nature: "/list",
    valence:
      "The surfaces this mode holds — each row with its id, slug, mime and entry. Use it to find the slug to " +
      "surface_update or surface_read, or to pin with buffer_create.",
    input: v.object({
      mime: SURFACE_MIME.optional().desc("Only the rows of this mime when given."),
    }),
  },
  async (ctx) => {
    const rows = await ctx.entities.surface.find(
      { mode: ctx.mode.entity.id, ...(ctx.input.mime !== undefined && { mime: ctx.input.mime }) },
      { orderBy: { updatedAt: "asc" } },
    );
    if (!rows.length) return { message: "no surfaces written yet." };
    return {
      message: `${rows.length} surface${rows.length === 1 ? "" : "s"} on this mode`,
      surface: rows.map(spoken),
    };
  },
);
