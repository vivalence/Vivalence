import { v, Vector } from "@vivalence/typology";

export const review = new Vector().open(
  {
    nature: "/review",
    valence: "Record outcomes for every literal the learner exercised — one batched call per " +
      "exchange. Reviews reschedule the due queue; an exchange you do not review never " +
      'happened. Example: { reviews: [{ literal: "leggere", signal: "SUCCESS" }, ' +
      '{ literal: "capire", signal: "FAILURE" }] }.',
    input: v.object({
      reviews: v.array(
        v.object({
          literal: v.string().desc("Literal slug or id."),
          signal: v.enum(["SUCCESS", "FAILURE"]),
        }),
      ),
    }),
  },
  async (ctx) => {
    if (!ctx.user?.id) {
      return {
        condition: "ERROR",
        output: { message: "no user on this thread — reviews need an owner" },
      };
    }
    const missing = [];
    let reviewed = 0;
    for (const { literal: reference, signal } of ctx.input.reviews) {
      const row = await ctx.daemon.entities.literal.findOne(
        ctx.daemon.entities.literal.reference(reference),
      );
      if (!row) {
        missing.push(reference);
        continue;
      }
      await row.review({ enum: signal }, ctx);
      reviewed += 1;
    }
    return {
      condition: missing.length ? "ERROR" : "NOMINAL",
      output: {
        message: `${reviewed} reviewed` +
          (missing.length ? ` — unknown literals skipped: ${missing.join(", ")}` : ""),
      },
    };
  },
);
