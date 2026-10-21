import { v, Vector } from "@vivalence/typology";
import paladin from "@vivalence/paladin";

const named = (row) => `"${row.trait?.LABELED?.name ?? `buffer ${row.index}`}"`;

export const buffer = new Vector()
  .open(
    {
      nature: "/buffer/update",
      valence: "Write a buffer — the shared working surface between you and the user. Pass " +
        "the buffer id and a data patch; the patch merges over the existing data keys. For a content " +
        "buffer pass `source` instead: the file it loads is rewritten in place, same row, new hash. The ids of " +
        "this thread's buffers are in the thread section of your context. Returns { message, " +
        "buffer: [{ id, index, status, mime, data, trait }] }. " +
        'Example: { id: "01a09010-18e0-736f-ad3f-a65b44d3fa43", data: { summary: "Six species on four continents." } }',
      input: v.object({
        id: v.string().desc(
          'The buffer id. Example: "01a0856f-425f-72b8-b36f-decc1bb2050e"',
        ),
        data: v.record(v.string(), v.unknown()).optional().desc(
          "Data keys to merge over buffer.data; keys you omit stay. " +
            'Example: { summary: "Six species on four continents." }',
        ),
        source: v.string().optional().desc(
          'New content for the file this buffer loads, whole. Example: "# Q3 · final\n\nRevenue …"',
        ),
      }),
    },
    async (ctx) => {
      if (ctx.input.data === undefined && ctx.input.source === undefined) {
        return { condition: "ERROR", message: "buffer_update needs a data patch, a source, or both — nothing to change." };
      }
      const row = await ctx.entities.buffer.findOneOrFail({ id: ctx.input.id }, { populate: ["files"] });
      if (ctx.input.data !== undefined) row.data = { ...row.data, ...ctx.input.data };
      if (ctx.input.source !== undefined) {
        const file = row.files.getItems().find((held) => held.mime === row.mime);
        if (file === undefined) {
          return { condition: "ERROR", message: `${named(row)} loads no file of its own kind ${row.mime} — a source needs a content buffer, buffer_create makes one.` };
        }
        const bytes = new TextEncoder().encode(ctx.input.source);
        await paladin.state.store(file.mount, bytes);
        await ctx.entities.file.rewrite(file, bytes);
      }
      await ctx.entities.em.flush();
      return { message: `updated ${named(row)}`, buffer: [row] };
    },
  )
  .open(
    {
      nature: "/buffer/label",
      valence: "Name a buffer. The label is what the operator reads on the buffer's line in the " +
        "chat and in the buffer list — set it when a buffer's subject is clearer than its " +
        "name, or when the operator asks. Returns { message, buffer: [{ id, index, status, data, view, trait }] }. " +
        'Example: { id: "01a0856f-425f-72b8-b36f-decc1bb2050e", label: { name: "Flamingo", ' +
        'description: "Six species, range and diet" } }',
      input: v.object({
        id: v.string().desc(
          'The buffer id. Example: "01a0856f-425f-72b8-b36f-decc1bb2050e"',
        ),
        label: v.primitives.Label,
      }),
    },
    async (ctx) => {
      const row = await ctx.entities.buffer.findOneOrFail({ id: ctx.input.id });
      row.trait = { ...row.trait, LABELED: ctx.input.label };
      await ctx.entities.em.flush();
      return { message: `labeled ${named(row)}`, buffer: [row] };
    },
  );
