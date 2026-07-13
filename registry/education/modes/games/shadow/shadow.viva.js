import { cast, App, Vector, v } from "@vivalence/typology";

import dataset from "./dataset/index.js";

const manifest = {
  type: "game",
  slug: "shadow",
  name: "Shadow",
  description:
    "Timed memorization then typed recall. Shows answer briefly, then tests. Per-token scoring for sentences. Speed presets.",
  version: "0.2.0",
  traits: ["APPLICATION", "EMITTER"],
};

const app = new App(
  "buffer/Shadow.svelte",
  v.buffer({
    data: {
      recall: v
        .union([v.string(), v.array(v.string())], {
          description: "LEARNING, KNOWN, per-literal array, or omit for random",
        })
        .optional(),
      speed: v
        .object({})
        .desc("Speed preset {rate: FAST|NORMAL|SLOW} or custom {base, multiplier}")
        .optional(),
    },
  }),
);

const emitter = new Vector()
  .open("/literals", async (ctx) => {
    const recall = ctx.input.recall;
    return ctx.mode.app.buffer({
      data: { recall, speed: ctx.input.speed ?? null },
      literals: ctx.input.literals ?? cast.array(ctx.input.literal),
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 3;
    const literals = await ctx.daemon.entities.literal.feed(
      ctx.input.where,
      { limit, blacklist: ctx.input.blacklist },
    );
    if (!literals.length) return [];
    return ctx.mode.app.buffer({
      data: {
        recall: ctx.input.recall,
        speed: ctx.input.speed ?? null,
      },
      literals,
    });
  });

export { manifest, app, emitter, dataset };
