import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "conjugation",

  name: "Conjugation",
  description: "Type the conjugated form from infinitive + person + tense.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Conjugation.svelte",
  v.buffer({
    data: {
      infinitive: v.string().desc("Literal ID of the infinitive"),
      target: v.string().desc("Literal ID of the form to type"),
      tense: v.string().desc("Symbol ID of the tense"),
      mood: v.string().desc("Symbol ID of the mood"),
      lemma: v.string().desc("Symbol ID of the lemma"),
      recall: v.string({ default: "LEARNING" }).desc("LEARNING or KNOWN"),
    },
  }),
);

const PERSON_SLOTS = [
  "firstSingular",
  "secondSingular",
  "thirdSingular",
  "firstPlural",
  "secondPlural",
  "thirdPlural",
];

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    const target = ctx.input.literal;
    const infinitive = ctx.input.infinitive;
    const recall = ctx.input.recall ?? "LEARNING";

    return ctx.mode.buffer({
      data: {
        target: target.id,
        infinitive: infinitive?.id,
        tense: ctx.input.tense?.id,
        mood: ctx.input.mood?.id,
        lemma: ctx.input.lemma?.id,
        recall,
      },
      literals: [target, infinitive].filter(Boolean),
      symbols: [ctx.input.tense, ctx.input.mood, ctx.input.lemma].filter(Boolean),
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 4;
    const lemmas = ctx.input.lemmas;

    const conjugations = await ctx.daemon.entities.conjugation.find(
      { lemma: { slug: { $in: lemmas } } },
      {
        populate: ["lemma", "tense", "mood", "infinitive", ...PERSON_SLOTS],
        orderBy: { averageRank: "ASC" },
      },
    );
    if (!conjugations.length) return [];

    // Flatten all populated slots into individual cards
    const cards = [];
    for (const conj of conjugations) {
      for (const slot of PERSON_SLOTS) {
        if (conj[slot]) {
          cards.push({
            literal: conj[slot],
            infinitive: conj.infinitive,
            tense: conj.tense,
            mood: conj.mood,
            lemma: conj.lemma,
          });
        }
      }
    }

    // Emit up to limit
    const buffers = [];
    for (const card of cards.slice(0, limit)) {
      buffers.push(
        await ctx.mode.emit.literal({
          ...card,
          recall: ctx.input.recall,
        }),
      );
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
            limit: 4,
            lemmas: [
              "word.lemma.falar",
              "word.lemma.precisar",
              "word.lemma.entender",
              "word.lemma.comer",
              "word.lemma.abrir",
              "word.lemma.partir",
              "word.lemma.ser",
              "word.lemma.estar",
              "word.lemma.ir",
              "word.lemma.ter",
              "word.lemma.poder",
              "word.lemma.querer",
              "word.lemma.saber",
              "word.lemma.fazer",
            ],
          },
        },
      },
    },
  ],
};

export { manifest, buffer, emitter, dataset };
