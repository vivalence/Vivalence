import { v, Vector } from "@vivalence/typology";
import * as types from "../types.js";

export const conjugations = new Vector().open(
  {
    nature: "/conjugations",
    valence: "Drill conjugation paradigms — draws conjugation rows and resolves them into their " +
      "member forms on screen. Scope with uses (the infinitives whose forms are failing) " +
      'or symbols; omit both for the memory feed. Example: { uses: ["leggere"], count: 2 }.',
    input: v.object({
      count: types.count,
      uses: v
        .array(v.string())
        .desc("Literal slugs or ids — paradigms USING these literals are drawn.")
        .optional(),
      symbols: v
        .array(v.string())
        .desc("Symbol slugs scoping the draw — they AND together.")
        .optional(),
    }),
  },
  async (ctx) => {
    const game = ctx.daemon.modes.game?.["rep-o-gram"];
    if (!game) return { condition: "ERROR", message: "rep-o-gram is not mounted" };

    const where = {};
    if (ctx.input.uses?.length) {
      const rows = await ctx.daemon.entities.literal.findByIdentifiers(ctx.input.uses);
      if (!rows.length) {
        return {
          condition: "ERROR",
          message: `no literals match ${
            ctx.input.uses.join(", ")
          } — check slugs via pull or entity_find`,
        };
      }
      where.uses = { $in: rows.map((row) => row.id) };
    }

    const emission = await game.emit.conjugations({
      where,
      ...(ctx.input.symbols?.length && { symbols: ctx.input.symbols }),
      count: ctx.input.count,
      ...(ctx.thread ? { thread: ctx.thread } : {}),
    });

    const buffers = emission.output.buffer ?? [];
    return {
      message: buffers.length
        ? "conjugation drill on screen."
        : "no paradigms matched these filters.",
      ...emission.output,
    };
  },
);
