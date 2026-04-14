import { BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "paradigm",
  name: "Paradigm",
  description: "Fill a conjugation table cell by cell. Type each form.",
  version: "0.2.0",
  traits: ["BUFFERED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Paradigm.svelte",
  v.buffer({
    data: {
      infinitive: v.string().desc("Literal ID of the infinitive"),
      firstSingular: v.string().optional(),
      thirdSingular: v.string().optional(),
      firstPlural: v.string().optional(),
      thirdPlural: v.string().optional(),
      tense: v.string().desc("Symbol ID of the tense"),
      mood: v.string().desc("Symbol ID of the mood"),
      lemma: v.string().desc("Symbol ID of the lemma"),
      recall: v
        .union([
          v.string(),
          v.object({
            firstSingular: v.string().optional(),
            thirdSingular: v.string().optional(),
            firstPlural: v.string().optional(),
            thirdPlural: v.string().optional(),
          }),
        ])
        .desc("LEARNING/KNOWN globally or per-slot")
        .optional(),
      feedback: v.string({ default: "realtime" }).desc("realtime or batch"),
      order: v.string({ default: "ordered" }).desc("ordered or random"),
    },
  }),
);

const emitter = new Vector()
  .open("/conjugation", async (ctx) => {
    const conjugation = ctx.input.conjugation;
    const conj = conjugation.trait.CONJUGATED;
    const bySlug = new Map(conjugation.uses.getItems().map((f) => [f.slug, f]));

    const data = {
      recall: ctx.input.recall ?? "LEARNING",
      feedback: ctx.input.feedback ?? "realtime",
      order: ctx.input.order ?? "ordered",
    };

    const literals = [];
    const infinitive = bySlug.get(conj.infinitive);
    if (infinitive) {
      data.infinitive = infinitive.id;
      literals.push(infinitive);
    }
    for (const [slot, slug] of Object.entries(conj.paradigm)) {
      const form = bySlug.get(slug);
      if (form) {
        data[slot] = form.id;
        literals.push(form);
      }
    }

    const symbols = conjugation.symbols.isInitialized() ? conjugation.symbols.getItems() : [];
    const lemma = symbols.find((s) => s.slug.startsWith("word.lemma."));
    const tense = symbols.find((s) => s.slug.startsWith("word.tense."));
    const mood = symbols.find((s) => s.slug.startsWith("word.mood."));
    if (lemma) data.lemma = lemma.id;
    if (tense) data.tense = tense.id;
    if (mood) data.mood = mood.id;

    return ctx.mode.buffer({
      data,
      literals: [conjugation, ...literals],
      symbols: [lemma, tense, mood].filter(Boolean),
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 1;

    const paradigms = await ctx.daemon.entities.literal.feed(
      { ontology: "conjugation", ...ctx.input.where },
      { limit, blacklist: ctx.input.blacklist, populate: ["uses", "symbols"] },
    );
    if (!paradigms.length) return [];

    const buffers = [];
    for (const p of paradigms) {
      buffers.push(
        await ctx.mode.emit.conjugation({
          conjugation: p,
          recall: ctx.input.recall,
          feedback: ctx.input.feedback,
          order: ctx.input.order,
        }),
      );
    }
    return buffers;
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Paradigm",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: {
          where: { ontology: "conjugation" },
          limit: 1,
        },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
    },
  ],
};

export { manifest, buffer, emitter, dataset };
