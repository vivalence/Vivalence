import { join } from "@std/path";
import paladin from "@vivalence/paladin";
import { mime, Path, v, Vector } from "@vivalence/typology";

export const GENERATIVE = (mode, context) => {
  const bundler = paladin.bundler(new Path(mode.mountpoint).absolute);

  mode.generator = {
    bundle: (data) => context.entities.view.bundle({ mode: mode.entity.id, ...data }, { bundler }),
    tools: tools(mode, context),
  };

  if (mode.module.generator) mode.generator.tools.graft(mode.module.generator);
};

const SLUG = v
  .string()
  .desc(
    'The view\'s name inside this mode — one view per (slug, mime); the same slug again rewrites it. Example: "pulse"',
  );

const VIEW_MIME = mime
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
    "The payload a view reads at buffer.data — whatever the source destructures. " +
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
  message: `${verb} refused: ${error.message}. The source is the problem — fix it and ${verb} again, do not retry it unchanged.`,
});

const failed = (verb, error) => ({
  condition: "ERROR",
  message: `${verb} failed: ${error.message}. Not the source — the runtime could not ${verb} this. Say so to the operator; do not retry.`,
});

const spoken = (view) => ({ id: view.id, slug: view.slug, mime: view.mime, entry: view.entry });

const kept = async (view) => {
  const files = await view.files.loadItems();
  return (
    files.find((file) => file.mime === view.mime) ?? files.find((file) => file.path === view.entry)
  );
};

const tools = (mode, context) => {
  const root = new Vector();

  root.open(
    {
      nature: "/buffer/create",
      valence:
        "Open a buffer on the operator's screen: a working area with a mime, live data, and the files it loads. " +
        "Pass `data` for a state the mode's views render, or `source` for content (markdown, org, html) the " +
        "client renders by mime — a source becomes a File this mode holds. `views` pins this mode's views by " +
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
        views: v
          .array(SLUG)
          .optional()
          .desc('Slugs of this mode\'s views to pin on the buffer. Example: ["pulse"]'),
      }),
    },
    async (ctx) => {
      try {
        const views =
          ctx.input.views === undefined
            ? {}
            : {
                views: (
                  await context.entities.view.find({
                    mode: mode.entity.id,
                    slug: { $in: ctx.input.views },
                  })
                ).map((view) => view.id),
              };
        const buffer = await context.entities.buffer.create({
          mode: mode.entity.id,
          mime: ctx.input.mime,
          ...(ctx.input.data !== undefined && { data: ctx.input.data }),
          ...(ctx.input.turn === undefined
            ? { thread: ctx.thread ?? null }
            : { turns: [ctx.input.turn] }),
          ...(ctx.input.label !== undefined && {
            traits: ["LABELED"],
            trait: { LABELED: ctx.input.label },
          }),
          ...views,
        });
        await context.entities.em.flush();
        if (ctx.input.source !== undefined) {
          const path = `${buffer.id}.${mime.extension(ctx.input.mime)}`;
          const mount = join(new Path(mode.mountpoint).absolute, path);
          const bytes = new TextEncoder().encode(ctx.input.source);
          await paladin.state.store(mount, bytes);
          buffer.files.add(await context.entities.file.record({ mode: mode.entity.id, path, mount, mime: ctx.input.mime, bytes }));
        }
        await context.entities.em.flush();
        return { message: `opened ${named(buffer)}`, buffer: [buffer] };
      } catch (error) {
        return failed("buffer_create", error);
      }
    },
  );

  const view = root.branch("/view");

  view.open(
    {
      nature: "/create",
      valence:
        "Write a view: code this mode ships to present a buffer. The source is compiled, content-addressed and " +
        "stored as this mode's Files; the row names the entry the client imports. A buffer of this mode shows " +
        "it once pinned (buffer_create `views`) or when it is the mode's only view. The same slug and mime again " +
        "rewrites the view in place — view_update does the same by slug. Returns the view row.",
      input: v.object({ slug: SLUG, mime: VIEW_MIME, source: SOURCE }),
    },
    async (ctx) => {
      let row;
      try {
        row = await mode.generator.bundle({
          slug: ctx.input.slug,
          mime: ctx.input.mime,
          source: ctx.input.source,
        });
      } catch (error) {
        return refused("view_create", error);
      }
      return { message: `wrote view "${row.slug}"`, view: [spoken(row)] };
    },
  );

  view.open(
    {
      nature: "/update",
      valence:
        "Rewrite a view you already wrote: the SAME row, by slug, gets new source; its Files are rebuilt in place " +
        "and every buffer showing it re-mounts. Use view_read first if you no longer have the source; revise " +
        "from it rather than rewriting.",
      input: v.object({
        slug: SLUG,
        mime: VIEW_MIME.optional().desc(
          "Which of the slug's rows when it has one per mime; the only one when left out.",
        ),
        source: SOURCE,
      }),
    },
    async (ctx) => {
      let held;
      try {
        held = await context.entities.view.findOneOrFail({
          mode: mode.entity.id,
          slug: ctx.input.slug,
          ...(ctx.input.mime !== undefined && { mime: ctx.input.mime }),
        });
      } catch (error) {
        return failed("view_update", error);
      }
      let row;
      try {
        row = await mode.generator.bundle({
          slug: held.slug,
          mime: held.mime,
          source: ctx.input.source,
        });
      } catch (error) {
        return refused("view_update", error);
      }
      return { message: `rewrote view "${row.slug}"`, view: [spoken(row)] };
    },
  );

  view.open(
    {
      nature: "/read",
      valence:
        "Read a view back by slug: the row, its Files, and the source you wrote, so you can view_update it " +
        "instead of rewriting it from memory.",
      input: v.object({
        slug: SLUG,
        mime: VIEW_MIME.optional().desc(
          "Which of the slug's rows when it has one per mime; the only one when left out.",
        ),
      }),
    },
    async (ctx) => {
      try {
        const held = await context.entities.view.findOneOrFail(
          {
            mode: mode.entity.id,
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
        return failed("view_read", error);
      }
    },
  );

  view.open(
    {
      nature: "/list",
      valence:
        "The views this mode holds — each row with its id, slug, mime and entry. Use it to find the slug to " +
        "view_update or view_read, or to pin with buffer_create.",
      input: v.object({
        mime: VIEW_MIME.optional().desc("Only the rows of this mime when given."),
      }),
    },
    async (ctx) => {
      const rows = await context.entities.view.find(
        { mode: mode.entity.id, ...(ctx.input.mime !== undefined && { mime: ctx.input.mime }) },
        { orderBy: { updatedAt: "asc" } },
      );
      if (!rows.length) return { message: "no views written yet." };
      return {
        message: `${rows.length} view${rows.length === 1 ? "" : "s"} on this mode`,
        view: rows.map(spoken),
      };
    },
  );

  return root;
};
