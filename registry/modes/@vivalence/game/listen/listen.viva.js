import { object, array, BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "listen",
  name: "Listen",
  description:
    "Audio-first recall. Pick or type the meaning/transcription. Requires VOCALIZED literal.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Listen.svelte",
  v.buffer({
    data: {
      recall: v
        .union([v.string(), v.array(v.string())], {
          description:
            "LEARNING: audio → produce known, KNOWN: audio → transcribe learning. Array for per-literal, omit for random.",
        })
        .optional(),
      gameplay: v
        .string({ default: "pick" })
        .desc("pick: select from candidates, type: free text input"),
      forgiving: v
        .boolean({ default: true })
        .desc("Normalize diacritics and case when evaluating typed input"),
    },
  }),
);

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    const lit = ctx.input.literal;
    const vocalized = lit.traits?.includes("VOCALIZED") ?? "VOCALIZED" in (lit.trait ?? {});
    if (!vocalized) return [];

    const gameplay = ctx.input.gameplay ?? "pick";
    let literals = [lit];

    if (gameplay === "pick") {
      const distractors =
        ctx.input.distractors ??
        (await ctx.daemon.entities.literal.feed({
          limit: 3,
          blacklist: ctx.input.blacklist,
          where: { ontology: lit.ontology },
        }));
      literals = [lit, ...distractors];
    }

    return ctx.mode.buffer({
      data: {
        target: lit.id,
        recall: ctx.input.recall ?? "LEARNING",
        gameplay,
        forgiving: ctx.input.forgiving ?? true,
      },
      literals,
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 4;
    const vocalized = await ctx.daemon.entities.literal.feed({
      limit: limit,
      blacklist: ctx.input.blacklist,
      where: object.merge({ traits: ["VOCALIZED"] }, ctx.input.where),
    });
    return ctx.mode.buffer({
      data: {
        recall: ctx.input.recall ?? "KNOWN",
        gameplay: "pick",
      },
      literals: vocalized,
    });
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Listen",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/feed",
          queue: 1,
          mask: { limit: 4 },
        },
      },
    },
  ],
};

export { manifest, buffer, emitter, dataset };
