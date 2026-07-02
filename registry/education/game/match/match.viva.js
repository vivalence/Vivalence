import { App, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "match",
  name: "Match",
  description:
    "Connect literal pairs across two columns. Batch mode. Failure is sticky per literal.",
  version: "0.1.0",
  traits: ["APPLICATION", "EMITTER"],
};

const app = new App(
  "buffer/Match.svelte",
  v.buffer({
    data: {
      recall: v
        .string({ default: "LEARNING" })
        .desc("LEARNING: known left ↔ learning right, KNOWN: reversed"),
      gameplay: v
        .string({ default: "TRANSLATE" })
        .desc("TRANSLATE: match TRANSLATED pairs, DESCRIBE: match descriptions to literals"),
      descriptions: v
        .array(v.string().desc("Parallel to literals — left-column text for describe gameplay"))
        .optional(),
    },
  }),
);

const emitter = new Vector()
  .open("/batch", async (ctx) => {
    return ctx.mode.buffer({
      data: {
        recall: ctx.input.recall ?? "LEARNING",
        gameplay: ctx.input.gameplay ?? "TRANSLATE",
        descriptions: ctx.input.descriptions,
      },
      literals: ctx.input.literals,
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 6;
    const literals = await ctx.daemon.entities.literal.feed(
      ctx.input.where,
      { limit, blacklist: ctx.input.blacklist },
    );
    if (literals.length < 2) return [];
    return ctx.mode.buffer({
      data: {
        recall: ctx.input.recall ?? "LEARNING",
        gameplay: ctx.input.gameplay ?? "TRANSLATE",
      },
      literals,
    });
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Match",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { limit: 6 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
    },
  ],
};

export { manifest, app, emitter, dataset };
