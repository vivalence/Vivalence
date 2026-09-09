import { v, Vector } from "@vivalence/typology";

export const thread = new Vector().open(
  {
    nature: "/thread/update",
    valence: "Write a thread's trait data — its configuration surface. Pass the thread id and a " +
      "trait patch keyed by trait name (e.g. MASKED query data); each named trait's data " +
      "merges over the existing value. This thread's id is in the thread section of your " +
      "context. Returns { message, thread: [{ id, phase, traits, trait, counter, cursor }] }. " +
      'Example: { id: "01a09010-13aa-778b-bce7-19c38f835337", trait: { LABELED: { name: "Q3 filings" } } }',
    input: v.object({
      id: v.string().desc(
        'The thread id. Example: "01a09010-13aa-778b-bce7-19c38f835337"',
      ),
      trait: v
        .record(v.string(), v.unknown())
        .desc(
          "Trait data to merge, keyed by trait name. " +
            'Example: { LABELED: { name: "Q3 filings", description: "the filings correspondence" } }',
        ),
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
