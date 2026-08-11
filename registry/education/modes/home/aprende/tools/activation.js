import { Vector, v } from "@vivalence/typology";

export const activation = new Vector().open(
  {
    nature: "/activation",
    valence: `Start a typing-practice session (activation) on the learner's screen. Pick source and count. `,
    input: v.object({
      source: v.enum(["byWeakness", "byDue"], { default: "byWeakness" }),
      count: v.integer({ minimum: 5, maximum: 50 }).default(20),
    }),
  },
  async (ctx) => {
    const emission = await ctx.mode.emit.activation({ ...ctx.input, thread: ctx.thread });
    return {
      message: emission.output.buffer.length
        ? `Session started — ${emission.output.buffer.length === 1 ? "one exercise" : `${emission.output.buffer.length} exercises`} on screen.`
        : "Nothing available for that selection.",
      ...emission.output,
    };
  },
);
