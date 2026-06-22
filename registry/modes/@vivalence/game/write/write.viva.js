import { cast, App, Vector, v } from "@vivalence/typology";
import dataset from "./dataset/index.js";

const manifest = {
  type: "game",
  slug: "write",
  name: "Write",
  description:
    "Type the translation from memory. Per-token scoring for sentences. Forgiving mode normalizes diacritics.",
  version: "0.2.0",
  traits: ["APPLICATION", "EMITTER"],
};

const app = new App(
  "buffer/Write.svelte",
  v.buffer({
    data: {
      recall: v
        .union([v.string(), v.array(v.string())], {
          description: "LEARNING, KNOWN, per-literal array, or omit for random",
        })
        .optional(),
      forgiving: v.boolean({ default: true }).desc("Normalize diacritics and case when evaluating"),
    },
  }),
);

const emitter = new Vector()
  .open("/literals", async (ctx) => {
    const recall = ctx.input.recall;
    return ctx.mode.buffer({
      data: { recall },
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
    return ctx.mode.buffer({
      data: { recall: ctx.input.recall },
      literals,
    });
  });

export { manifest, app, emitter, dataset };
