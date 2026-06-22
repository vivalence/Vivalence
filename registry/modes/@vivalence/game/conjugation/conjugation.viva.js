import { array, App, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "conjugation",

  name: "Conjugation",
  description: "Type the conjugated form from infinitive + person + tense.",
  version: "0.2.0",
  traits: ["APPLICATION", "EMITTER"],
};

const app = new App(
  "buffer/Conjugation.svelte",
  v.buffer({
    data: {
      infinitive: v.string().desc("Literal ID of the infinitive"),
      target: v.string().desc("Literal ID of the form to type"),
      tense: v.string().desc("Symbol ID of the tense"),
      mood: v.string().desc("Symbol ID of the mood"),
      lemma: v.string().desc("Symbol ID of the lemma"),
      recall: v.string({ default: "LEARNING" }).desc("always LEARNING"),
    },
  }),
);

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    const target = ctx.input.literal;

    let { infinitive, tense, mood, lemma } = ctx.input;

    if (!infinitive) {
      const [conjugation] = await ctx.daemon.entities.literal.find(
        { ontology: "conjugation", uses: target.id },
        { limit: 1, populate: ["uses", "symbols"] },
      );
      if (!conjugation) return;

      infinitive = conjugation.uses
        .getItems()
        .find((u) => u.slug === conjugation.trait.CONJUGATED.infinitive);

      const symbols = conjugation.symbols.getItems();
      tense = symbols.find((s) => s.slug.startsWith("word.tense."));
      mood = symbols.find((s) => s.slug.startsWith("word.mood."));
      lemma = symbols.find((s) => s.slug.startsWith("word.lemma."));
    }

    return ctx.mode.buffer({
      data: {
        target: target.id,
        infinitive: infinitive?.id,
        tense: tense?.id,
        mood: mood?.id,
        lemma: lemma?.id,
      },
      literals: [target, infinitive].filter(Boolean),
      symbols: [tense, mood, lemma].filter(Boolean),
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 4;

    const conjugations = await ctx.daemon.entities.literal.feed(
      { ontology: "conjugation", ...ctx.input.where },
      { limit, blacklist: ctx.input.blacklist, populate: ["uses", "symbols"] },
    );
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
      buffers.push(await ctx.mode.emit.literal(card));
    }
    return buffers;
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Conjugation",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { ontology: "conjugation" }, limit: 4 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
    },
  ],
};

export { manifest, app, emitter, dataset };
