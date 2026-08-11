import { Vector, v } from "@vivalence/typology";

const BUCKETS = {
  vocabolario: ["word"],
  grammatica: ["conjugation"],
  frasi: ["sentence"],
};

export const drill = new Vector().open(
  {
    nature: "/drill",
    valence:
      "Put a screen exercise in front of the learner from one of the three impara buckets — " +
      "vocabolario (words), grammatica (conjugation paradigms), frasi (sentences). Pull first " +
      "and steer with symbols from real items. Keep count small for fresh material — two or " +
      "three items in tight rotation, not nine. Prompts, corrections and ambushes stay in chat.",
    input: v.object({
      bucket: v.enum(["vocabolario", "grammatica", "frasi"]),
      count: v.integer({ minimum: 1, maximum: 12 }).default(3),
      symbols: v.array(v.string()).optional(),
    }),
  },
  async (ctx) => {
    const impara = ctx.daemon.modes.tactic?.impara;
    if (!impara) return { condition: "ERROR", message: "the impara course is not mounted" };

    const emission = await impara.emit[ctx.input.bucket]({
      where: { symbols: [...BUCKETS[ctx.input.bucket], ...(ctx.input.symbols ?? [])] },
      limit: ctx.input.count,
      thread: ctx.thread,
    });

    const buffers = emission.output.buffer ?? [];
    return {
      message: buffers.length
        ? `${buffers.length === 1 ? "one exercise" : `${buffers.length} exercises`} on screen from ${ctx.input.bucket}.`
        : `nothing to drill in ${ctx.input.bucket} for these filters.`,
      ...emission.output,
    };
  },
);
