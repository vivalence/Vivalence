import { v, Vector } from "@vivalence/typology";

export const thread = new Vector().open(
  {
    nature: "/thread/update",
    valence: "Write a thread's trait data — its configuration surface. Pass the thread id and a " +
      "trait patch keyed by trait name (e.g. MASKED query data); each named trait's data " +
      "merges over the existing value.",
    input: v.object({
      id: v.string().desc("The thread id."),
      trait: v
        .record(v.string(), v.unknown())
        .desc("Trait data to merge, keyed by trait name."),
    }),
  },
  async (ctx) => {
    const row = await ctx.daemon.entities.thread.findOneOrFail({
      id: ctx.input.id,
    });
    row.trait = { ...row.trait, ...ctx.input.trait };
    await ctx.daemon.entities.em.flush();
    return { message: `thread ${row.id} updated`, thread: [row] };
  },
);
