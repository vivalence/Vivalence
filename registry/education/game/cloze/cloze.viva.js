import { App, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "cloze",
  name: "Cloze",
  description:
    "Fill blanked tokens in a sentence. Typed, picked, or audio-prompted. Per-token review.",
  version: "0.1.0",
  traits: ["APPLICATION", "EMITTER"],
};

const app = new App(
  "buffer/Cloze.svelte",
  v.buffer({
    data: {
      recall: v
        .string({ default: "LEARNING" })
        .desc("LEARNING: known→learning, KNOWN: learning→known"),
      gameplay: v
        .string({ default: "TYPE" })
        .desc("TYPE: free input, PICK: select from options, LISTEN: audio prompt with blanks"),
      blankIndices: v
        .array(v.number(), { default: [] })
        .desc("Token positions to blank in the ANNOTATED sentence"),
      options: v.array(v.string().desc("Shuffled answer candidates for pick gameplay")).optional(),
      forgiving: v
        .boolean({ default: true })
        .desc("Normalize diacritics and case when evaluating typed input"),
    },
  }),
);

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    return ctx.mode.app.buffer({
      data: {
        recall: ctx.input.recall ?? "LEARNING",
        gameplay: ctx.input.gameplay ?? "TYPE",
        blankIndices: ctx.input.blankIndices ?? [0],
        options: ctx.input.options,
        forgiving: ctx.input.forgiving ?? true,
      },
      literals: [ctx.input.literal],
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 1;
    const all = await ctx.daemon.entities.literal.feed(
      ctx.input.where,
      { limit: limit * 3, blacklist: ctx.input.blacklist },
    );
    const annotated = all.filter((l) => l.traits?.includes("ANNOTATED"));
    if (!annotated.length) return [];
    const lit = annotated[0];
    const tokens = lit.trait?.ANNOTATED?.tokens ?? [];
    const blankIndices = tokens.length ? [Math.floor(Math.random() * tokens.length)] : [0];
    return ctx.mode.app.buffer({
      data: {
        recall: ctx.input.recall ?? "LEARNING",
        gameplay: ctx.input.gameplay ?? "TYPE",
        blankIndices,
        forgiving: true,
      },
      literals: [lit],
    });
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Cloze",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { limit: 1 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
    },
  ],
};

export { manifest, app, emitter, dataset };
