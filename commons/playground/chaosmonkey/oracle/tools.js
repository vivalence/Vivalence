import { belt, v, Vector } from "@vivalence/typology";

// the oracle's one tool — it does nothing but take time. `--tool lookup` on the stub sends the
// model here, and the dispatch child it runs under is what draws a second bar in the F row.
export const tools = new Vector().open(
  {
    nature: "/lookup",
    valence:
      "Consult the oracle's index. It answers slowly on purpose — this is the chaosmonkey " +
      "testbed, and the wait is the point: a tool round is where a hold or a kill lands.",
    input: v.object({
      query: v.string().desc('What to look up. Example: "flamingo"'),
      hold: v.integer({ minimum: 0, maximum: 60000 }).desc("How long to take, in ms. Example: 1500").default(1500).optional(),
    }),
  },
  async (ctx) => {
    const held = ctx.input.hold ?? 1500;
    ctx.controller?.stdout.note({ lookup: ctx.input.query, hold: held });
    await belt.sleep.ms(held);
    return { message: `the index says: ${ctx.input.query} (${held}ms)` };
  },
);
