import { object, array, string, BufferView, Vector, v } from "@vivalence/typology";

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
      const recall = ctx.input.recall ?? "LEARNING";
      const textOf = (l) =>
        recall === "KNOWN" ? l.trait?.TRANSLATED?.known : l.trait?.TRANSLATED?.learning;
      const learningOf = (l) => string.fold(l.trait?.TRANSLATED?.learning ?? "");
      const target = string.fold(textOf(lit) ?? "");
      const targetLearning = learningOf(lit);

      const pool =
        ctx.input.distractors ??
        (await ctx.daemon.entities.literal.feed({
          limit: 6,
          blacklist: ctx.input.blacklist,
          where: { ontology: lit.ontology },
        }));

      const seen = new Set([target]);
      const seenLearning = new Set([targetLearning]);
      const scored = [];
      for (const d of pool) {
        const t = string.fold(textOf(d) ?? "");
        if (seen.has(t)) continue;
        const l = learningOf(d);
        if (seenLearning.has(l)) continue;
        seen.add(t);
        seenLearning.add(l);
        scored.push({ d, score: string.dice(target, t) });
      }
      scored.sort((a, b) => b.score - a.score);
      literals = [lit, ...scored.slice(0, 3).map((s) => s.d)];
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
