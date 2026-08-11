import { Vector, v } from "@vivalence/typology";

const preset = v.enum(["flashcard", "write"]);

export const deck = new Vector().open(
  {
    nature: "/deck",
    input: v.object({
      count: v.integer({ minimum: 1, maximum: 50 }).default(20),
      ontology: v.enum(["word", "sentence"]).default("word"),
      games: v.array(preset).default(["flashcard"]),
      symbols: v.array(v.string()).default([]),
      thread: v.string().optional(),
    }),
  },
  async (ctx) => {
    const roster = ctx.input.games.length ? ctx.input.games : ["flashcard"];
    const where = { symbols: [ctx.input.ontology, ...ctx.input.symbols] };

    const per = Math.floor(ctx.input.count / roster.length);
    const extra = ctx.input.count % roster.length;

    for (let index = 0; index < roster.length; index++) {
      const count = per + (index < extra ? 1 : 0);
      if (count < 1) continue;
      const emitted = await ctx.daemon.modes.game["rep-o-gram"].emit[roster[index]].feed({
        count,
        where,
        thread: ctx.input.thread,
      });
      for (const buffer of [].concat(emitted)) if (buffer) ctx.pool.add(buffer);
    }
  },
);
