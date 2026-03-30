import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "match",
  name: "Match",
  description: "Connect literal pairs across two columns. Batch mode. Failure is sticky per literal.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Match.svelte",
  v.buffer({
    data: {
      recall: v.string({ default: "LEARNING" }).desc("LEARNING: known left ↔ learning right, KNOWN: reversed"),
      gameplay: v.string({ default: "translate" }).desc("translate: match TRANSLATED pairs, describe: match descriptions to literals"),
      descriptions: v.array(v.string().desc("Parallel to literals — left-column text for describe gameplay")).optional(),
    },
  }),
);

const emitter = new Vector()
  .open("/batch", async (ctx) => {
    return ctx.mode.buffer({
      data: {
        recall: ctx.input.recall ?? "LEARNING",
        gameplay: ctx.input.gameplay ?? "translate",
        descriptions: ctx.input.descriptions,
      },
      literals: ctx.input.literals,
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 6;
    const literals = await ctx.daemon.entities.literal.feed({
      limit,
      blacklist: ctx.input.blacklist,
      where: ctx.input.where,
    });
    if (literals.length < 2) return [];
    return ctx.mode.buffer({
      data: {
        recall: ctx.input.recall ?? "LEARNING",
        gameplay: ctx.input.gameplay ?? "translate",
      },
      literals,
    });
  });

const dataset = {
  intent: [{
    slug: "feed",
    name: "Match",
    type: "APPLICATIVE",
    traits: ["FEEDING"],
    trait: {
      FEEDING: {
        mount: "/emit/feed",
        queue: 1,
        mask: { limit: 6 },
      },
    },
  }],
};

export { manifest, buffer, emitter, dataset };
