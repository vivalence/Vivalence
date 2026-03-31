import { array, BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "conjugation",

  name: "Conjugation",
  description: "Type the conjugated form from infinitive + person + tense.",
  version: "0.2.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Conjugation.svelte",
  v.buffer({
    data: {
      conjugation: v.string().optional().desc("Literal ID of the conjugation"),
      infinitive: v.string().desc("Literal ID of the infinitive"),
      target: v.string().desc("Literal ID of the form to type"),
      tense: v.string().desc("Symbol ID of the tense"),
      mood: v.string().desc("Symbol ID of the mood"),
      lemma: v.string().desc("Symbol ID of the lemma"),
      recall: v.string({ default: "LEARNING" }).desc("LEARNING or KNOWN"),
    },
  }),
);

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    const target = ctx.input.literal;
    const infinitive = ctx.input.infinitive;
    const conjugation = ctx.input.conjugation;
    const recall = ctx.input.recall ?? "LEARNING";

    return ctx.mode.buffer({
      data: {
        conjugation: conjugation?.id,
        target: target.id,
        infinitive: infinitive?.id,
        tense: ctx.input.tense?.id,
        mood: ctx.input.mood?.id,
        lemma: ctx.input.lemma?.id,
        recall,
      },
      literals: [target, infinitive, conjugation].filter(Boolean),
      symbols: [ctx.input.tense, ctx.input.mood, ctx.input.lemma].filter(Boolean),
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 4;

    const conjugations = await ctx.daemon.entities.literal.feed({
      limit,
      blacklist: ctx.input.blacklist,
      where: { ontology: "conjugation", ...ctx.input.where },
      populate: ["uses", "symbols"],
    });
    if (!conjugations.length) return [];

    const cards = [];
    for (const p of conjugations) {
      const conj = p.trait.CONJUGATED;
      const bySlug = new Map(p.uses.getItems().map((f) => [f.slug, f]));
      const infinitive = bySlug.get(conj.infinitive);
      const symbols = p.symbols.getItems();
      const tense = symbols.find((s) => s.slug.startsWith("word.tense."));
      const mood = symbols.find((s) => s.slug.startsWith("word.mood."));
      const lemma = symbols.find((s) => s.slug.startsWith("word.lemma."));

      for (const slug of Object.values(conj.conjugation)) {
        const form = bySlug.get(slug);
        if (form) cards.push({ literal: form, infinitive, tense, mood, lemma, conjugation: p });
      }
    }

    const buffers = [];
    for (const card of array.shuffle(cards)) {
      buffers.push(await ctx.mode.emit.literal({ ...card, recall: ctx.input.recall }));
    }
    return buffers;
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Conjugation",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/feed",
          queue: 1,
          mask: {
            where: { ontology: "conjugation" },
            limit: 4,
          },
        },
      },
    },
  ],
};

export { manifest, buffer, emitter, dataset };
