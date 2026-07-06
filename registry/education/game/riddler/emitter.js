import { Vector, v } from "@vivalence/typology";

// /riddle/fromSymbol — pull a literal pool from the given symbol set (optionally narrowed
// to explicit literals), let the harness compose ONE riddle + its expected answer in the
// target language, and drop a self-contained riddle buffer into the pool. Turn-free: the
// whole challenge lives on the buffer (data.riddle / data.answer / data.history), never on
// a thread. Persona comes from the harness (mode.module.harness) — this emitter only hands
// the composition brief in via the nicer harness interface ({ system, prompt, schema }).
export const emitter = new Vector().open(
  {
    nature: "/riddle/fromSymbol",
    input: v.object({
      symbols: v.array(v.string()).optional(),
      literals: v.array(v.string()).optional(),
      limit: v.integer({ default: 12 }),
      instructions: v.string().optional(),
    }),
    output: v.object({ riddle: v.string(), answer: v.string() }),
  },
  async (ctx) => {
    // explicit literals win; otherwise pull the symbol set, always with memory strength.
    const pool = ctx.input.literals?.length
      ? await ctx.daemon.entities.literal.find(
          { id: { $in: ctx.input.literals } },
          { populate: ["memories", "memories.strength"] },
        )
      : await ctx.daemon.entities.literal.feed(
          { symbols: ctx.input.symbols ?? [] },
          { limit: ctx.input.limit, populate: ["memories", "memories.strength"] },
        );

    if (!pool.length) return;

    const vocabulary = pool
      .map(
        (literal) =>
          `${literal.slug}: ${literal.trait?.TRANSLATED?.learning} (${literal.trait?.TRANSLATED?.known})`,
      )
      .join("; ");

    const { object } = await ctx.mode.harness.object.render({
      system: [
        "Compose ONE riddle in the target language, drawn from this vocabulary:",
        vocabulary,
        ctx.input.instructions ? `Extra instructions: ${ctx.input.instructions}` : null,
        "Return the riddle and its single expected answer.",
      ]
        .filter(Boolean)
        .join("\n"),
      prompt: "Compose the riddle now.",
      output: v.object({ riddle: v.string(), answer: v.string() }),
      tune: "frugal",
    });

    if (!object) return;

    ctx.pool.add(
      ctx.mode.app.buffer({
        data: { riddle: object.riddle, answer: object.answer, history: [] },
        literals: pool,
      }),
    );
  },
);
