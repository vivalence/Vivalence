import { cast, BufferView, Vector, v } from "@vivalence/typology";

import dataset from "./dataset/index.js";

const manifest = {
  type: "game",
  slug: "shadow",
  name: "Shadow",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView("buffer/Shadow.svelte", v.buffer({
  data: {
    recall: v.union([v.string(), v.array(v.string())], {
      description: "LEARNING, KNOWN, per-literal array, or omit for random",
    }).optional(),
    speed: v.object({}).desc("Speed preset {rate: FAST|NORMAL|SLOW} or custom {base, multiplier}").optional(),
  },
}));

const emitter = new Vector()
  .open("/literals", async (ctx) => {
    const recall = ctx.input.recall;
    return ctx.mode.buffer({
      data: { recall, speed: ctx.input.speed ?? null },
      literals: ctx.input.literals ?? cast.array(ctx.input.literal),
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 3;
    const literals = await ctx.daemon.entities.literal.feed({
      limit,
      blacklist: ctx.input.blacklist,
      where: ctx.input.where,
    });
    if (!literals.length) return [];
    return ctx.mode.buffer({
      data: {
        recall: ctx.input.recall,
        speed: ctx.input.speed ?? null,
      },
      literals,
    });
  });

export { manifest, buffer, emitter, dataset };
