import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "pick",
  name: "Pick",
  description: "Multiple choice from distractors. One tap. Wrong pick penalizes both target and distractor.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Pick.svelte",
  v.buffer({
    data: {
      recall: v.string({ default: "LEARNING" }).desc("LEARNING: known→pick learning, KNOWN: learning→pick known"),
    },
  }),
);

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    let distractors = ctx.input.distractors ?? [];
    if (!distractors.length) {
      distractors = await ctx.daemon.entities.literal.feed({
                limit: 3,
        blacklist: ctx.input.blacklist,
        where: { symbol: { word: ctx.input.literal.symbol?.word } },
      });
    }
    return ctx.mode.buffer({
      data: { recall: ctx.input.recall ?? "LEARNING" },
      literals: [ctx.input.literal, ...distractors],
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 4;
    const literals = await ctx.daemon.entities.literal.feed({
            limit,
      blacklist: ctx.input.blacklist,
      where: ctx.input.where,
    });
    if (literals.length < 2) return [];
    return ctx.mode.buffer({
      data: { recall: ctx.input.defaults?.recall ?? "LEARNING" },
      literals,
    });
  });

const dataset = {
  intent: [{
    slug: "feed",
    name: "Pick",
    type: "APPLICATIVE",
    traits: ["FEEDING"],
    trait: {
      FEEDING: {
        mount: "/emit/feed",
        queue: 1,
        mask: { limit: 4 },
      },
    },
  }],
};

export { manifest, buffer, emitter, dataset };
