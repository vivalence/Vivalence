import { cast, object, App, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "write",
  name: "Write",
  description:
    "Type the translation from memory. Per-token scoring for sentences. Forgiving mode normalizes diacritics.",
  version: "0.2.0",
  traits: ["APPLICATION", "EMITTER", "INTENTED"],
};

const ontology = ["word", "sentence"];

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
    return ctx.mode.app.buffer({
      data: { recall },
      literals: ctx.input.literals ?? cast.array(ctx.input.literal),
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 3;
    const literals = await ctx.daemon.entities.literal.feed(
      object.merge(ctx.input.where, { ontology: { $in: ontology } }),
      {
        limit,
        blacklist: ctx.input.blacklist,
      },
    );
    if (!literals.length) return [];
    return ctx.mode.app.buffer({
      data: { recall: ctx.input.recall },
      literals,
    });
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Write",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { batch: 3 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
    },
  ],
};
export { manifest, app, emitter, dataset };
