import { cast, BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "flashcard",
  name: "Flashcard",
  description: "Classic flashcard recall for words and sentences, both directions.",
  version: "0.1.0",
  traits: ["BUFFERED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Flashcard.svelte",
  v.buffer({
    data: {
      recall: v
        .union([v.string(), v.array(v.string())], {
          description: "LEARNING, KNOWN, per-literal array, or omit for random",
        })
        .optional(),
    },
  }),
);

const emitter = new Vector()
  .open("/literals", async (ctx) => {
    return ctx.mode.buffer({
      data: { recall: ctx.input.recall },
      literals: ctx.input.literals ?? cast.array(ctx.input.literal),
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 5;
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

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Flashcard",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/feed",
          queue: 1,
          mask: { limit: 5 },
        },
      },
    },
  ],
};

export { manifest, buffer, emitter, dataset };
