import { object, string, App, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "listen",
  name: "Listen",
  description:
    "Audio-first recall. Pick or type the meaning/transcription. Requires VOCALIZED literal.",
  version: "0.1.0",
  traits: ["APPLICATION", "EMITTER", "INTENTED"],
};

const ontology = ["word", "sentence"];

const app = new App(
  "Listen.svelte",
  v.buffer({
    data: {
      recall: v
        .union([v.string(), v.array(v.string())], {
          description:
            "LEARNING: audio → produce known, KNOWN: audio → transcribe learning. Array for per-literal, omit for random.",
        })
        .optional(),
      gameplay: v
        .string({ default: "PICK" })
        .desc("PICK: select from candidates, TYPE: free text input"),
      forgiving: v
        .boolean({ default: true })
        .desc("Normalize diacritics and case when evaluating typed input"),
    },
  }),
);

const listenable = (daemon, literal) => {
  if (!literal?.traits?.includes("VOCALIZED")) return false;
  const asset = literal.trait?.VOCALIZED?.asset;
  if (asset?.path) return Boolean(daemon.cargo[asset.path]);
  if (asset?.slug)
    return Object.keys(daemon.cargo).some(
      (key) => key.endsWith("/" + asset.slug) || key.startsWith(asset.slug),
    );
  return false;
};

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    const lit = ctx.input.literal;
    if (!listenable(ctx.daemon, lit)) return [];

    const gameplay = ctx.input.gameplay ?? "PICK";
    let literals = [lit];

    if (gameplay === "PICK") {
      const recall = ctx.input.recall ?? "LEARNING";
      const textOf = (l) =>
        recall === "KNOWN" ? l.trait?.TRANSLATED?.known : l.trait?.TRANSLATED?.learning;
      const learningOf = (l) => string.fold(l.trait?.TRANSLATED?.learning ?? "");
      const target = string.fold(textOf(lit) ?? "");
      const targetLearning = learningOf(lit);

      const pool =
        ctx.input.distractors ??
        (await ctx.daemon.entities.literal.feed(
          { ontology: lit.ontology },
          { limit: 6, blacklist: ctx.input.blacklist },
        ));

      const seen = new Set([target]);
      const seenLearning = new Set([targetLearning]);
      const scored = [];
      for (const d of pool) {
        if (d.id === lit.id) continue;
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

    return ctx.mode.app.buffer({
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
    const pool = await ctx.daemon.entities.literal.feed(
      object.merge(ctx.input.where, { ontology: { $in: ontology } }),
      {
        limit: limit * 3,
        blacklist: ctx.input.blacklist,
      },
    );
    const vocalized = pool.filter((literal) => listenable(ctx.daemon, literal)).slice(0, limit);
    if (!vocalized.length) return [];
    return ctx.mode.app.buffer({
      data: {
        recall: ctx.input.recall ?? "KNOWN",
        gameplay: "TYPE",
      },
      literals: vocalized,
    });
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Listen",
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
