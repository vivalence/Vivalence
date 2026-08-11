import { v, Vector } from "@vivalence/typology";

export const buffer = new Vector().open(
  {
    nature: "/buffer/update",
    valence: "Write a buffer's data — the shared working surface between you and the user. Pass " +
      "the buffer id and a data patch; the patch merges over the existing data keys.",
    input: v.object({
      id: v.string().desc("The buffer id."),
      data: v.record(v.string(), v.unknown()).desc(
        "Data keys to merge over buffer.data.",
      ),
    }),
  },
  async (ctx) => {
    const row = await ctx.daemon.entities.buffer.findOneOrFail({
      id: ctx.input.id,
    });
    row.data = { ...row.data, ...ctx.input.data };
    await ctx.daemon.entities.em.flush();
    return { message: `buffer ${row.id} updated`, buffer: [row] };
  },
);
