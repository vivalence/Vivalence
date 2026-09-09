import { v, Vector } from "@vivalence/typology";

const named = (row) => `"${row.trait?.LABELED?.name ?? `buffer ${row.index}`}"`;

export const buffer = new Vector()
  .open(
    {
      nature: "/buffer/update",
      valence: "Write a buffer's data — the shared working surface between you and the user. Pass " +
        "the buffer id and a data patch; the patch merges over the existing data keys.",
      input: v.object({
        id: v.string().desc(
          'The buffer id. Example: "01a0856f-425f-72b8-b36f-decc1bb2050e"',
        ),
        data: v.record(v.string(), v.unknown()).desc(
          "Data keys to merge over buffer.data; keys you omit stay. " +
            'Example: { summary: "Six species on four continents." }',
        ),
      }),
    },
    async (ctx) => {
      const row = await ctx.daemon.entities.buffer.findOneOrFail({
        id: ctx.input.id,
      });
      row.data = { ...row.data, ...ctx.input.data };
      await ctx.daemon.entities.em.flush();
      return { message: `updated ${named(row)}`, buffer: [row] };
    },
  )
  .open(
    {
      nature: "/buffer/label",
      valence: "Name a buffer. The label is what the operator reads on the buffer's line in the " +
        "chat and in the buffer list — set it when a buffer's subject is clearer than its " +
        "name, or when the operator asks. " +
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
      const row = await ctx.daemon.entities.buffer.findOneOrFail({ id: ctx.input.id });
      row.trait = { ...row.trait, LABELED: ctx.input.label };
      await ctx.daemon.entities.em.flush();
      return { message: `labeled ${named(row)}`, buffer: [row] };
    },
  );
