import { cast, App, Vector, v } from "@vivalence/typology";

export const manifest = {
  type: "game",
  slug: "flashcard",
  name: "Flashcard",
  description: "Classic flashcard recall for words and sentences, both directions.",
  version: "0.1.0",
  traits: ["APPLICATION", "EMITTER"],
};

const recallOptions = v.enum(["LEARNING", "KNOWN"]);
const recall = v
  .union([recallOptions, v.array(recallOptions)], {
    description: "LEARNING, KNOWN, per-literal array, or omit for random",
  })
  .optional();

export const app = new App(
  "buffer/Flashcard.svelte",
  v.buffer({
    data: { recall },
    literals: v.array(v.rel(v.literal())),
  }),
);

export const emitter = new Vector()
  .open(
    {
      nature: "/literals",
      input: v.object({
        recall,
        literals: v.array(v.rel(v.literal())),
      }),
    },
    async (ctx) => {
      return ctx.mode.buffer({
        data: { recall: ctx.input.recall },
        literals: ctx.input.literals,
      });
    },
  )
  .open(
    {
      nature: "/feed",
      input: v.object({
        recall,
        limit: v.integer({ minimum: 1 }).default(5),
        where: v.object({}).optional(),
      }),
    },
    async (ctx) => {
      console.log("/feed", { input: ctx.input });
      const limit = ctx.input.limit;
      const literals = await ctx.daemon.entities.literal.feed(ctx.input.where, {
        limit,
        blacklist: ctx.input.blacklist,
      });
      if (!literals.length) return [];
      return ctx.mode.buffer({
        data: { recall: ctx.input.recall },
        literals,
      });
    },
  );

// const dataset = {intent: [{slug: "feed", name: "Flashcard", traits: ["MASKED", "AIMED", "QUEUEING"], trait: {MASKED: { limit: 5 }, AIMED: { mount: "/emit/feed" }, QUEUEING: { depth: 1 },},},],};
