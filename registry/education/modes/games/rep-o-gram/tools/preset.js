import { v, Vector } from "@vivalence/typology";
import * as types from "../types.js";
import * as fold from "../fold.js";

export const preset = new Vector().open(
  {
    nature: "/preset",
    valence: "Put a named rep preset on the learner's screen — the axes come from the preset " +
      "table, you supply the material. Presets: " +
      Object.keys(types.PRESETS).join(" · ") +
      ". Three sources, picked in order: authored knowables (your own pairs — they rep " +
      "without touching the retention), a symbol scope (drawn from the corpus, AND per " +
      "symbol), or the plain memory feed. Keep count small — two or three fresh items " +
      'beat nine stale ones. Example: { preset: "listen", symbols: ["food"], count: 3 }.',
    input: v.object({
      preset: v.enum(Object.keys(types.PRESETS)),
      count: types.count,
      symbols: v
        .array(v.string())
        .desc("Symbol slugs scoping the draw — they AND together.")
        .optional(),
      knowables: v
        .array(
          v.object({
            known: v.string().desc("The pair's face in the learner's native language."),
            learning: v.string().desc("The pair's face in the language being learned."),
          }),
        )
        .desc("Author the set yourself — reps without touching the retention.")
        .optional(),
    }),
  },
  async (ctx) => {
    const game = ctx.daemon.modes.game?.["rep-o-gram"];
    if (!game) return { condition: "ERROR", message: "rep-o-gram is not mounted" };

    const branch = game.emit[ctx.input.preset];
    const input = ctx.thread ? { thread: ctx.thread } : {};

    const emission = ctx.input.knowables?.length
      ? await branch.knowables({
        ...input,
        knowables: ctx.input.knowables.map(fold.authored),
      })
      : ctx.input.symbols?.length
      ? await branch.symbols({
        ...input,
        symbols: ctx.input.symbols,
        count: ctx.input.count,
      })
      : await branch.feed({ ...input, count: ctx.input.count });

    const buffers = emission.output.buffer ?? [];
    return {
      message: buffers.length
        ? `${ctx.input.preset} session on screen.`
        : `nothing to rep for these filters — the ${ctx.input.preset} draw came back empty.`,
      ...emission.output,
    };
  },
);
