import { string, View, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "pick",
  name: "Pick",
  description:
    "Multiple choice from distractors. One tap. Wrong pick penalizes both target and distractor.",
  version: "0.1.0",
  traits: ["VIEWABLE", "EMITTER"],
};

const view = new View(
  "buffer/Pick.svelte",
  v.buffer({
    data: {
      recall: v
        .string({ default: "LEARNING" })
        .desc("LEARNING: known→pick learning, KNOWN: learning→pick known"),
    },
  }),
);

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    const lit = ctx.input.literal;
    const recall = ctx.input.recall ?? "LEARNING";
    const textOf = (l) =>
      recall === "KNOWN" ? l.trait?.TRANSLATED?.known : l.trait?.TRANSLATED?.learning;
    const target = string.fold(textOf(lit) ?? "");
    const learningOf = (l) => string.fold(l.trait?.TRANSLATED?.learning ?? "");
    const targetLearning = learningOf(lit);

    let pool = ctx.input.distractors ?? [];
    if (!pool.length) {
      pool = await ctx.daemon.entities.literal.feed(
        { ontology: lit.ontology },
        { limit: 6, blacklist: ctx.input.blacklist },
      );
    }

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

    return ctx.mode.buffer({
      data: { target: lit.id, recall },
      literals: [lit, ...scored.slice(0, 3).map((s) => s.d)],
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 4;
    const literals = await ctx.daemon.entities.literal.feed(
      ctx.input.where,
      { limit, blacklist: ctx.input.blacklist },
    );
    if (literals.length < 2) return [];
    return ctx.mode.buffer({
      data: { recall: ctx.input.recall ?? "LEARNING" },
      literals,
    });
  });

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Pick",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { limit: 4 },
        AIMED: { mount: "/emit/feed" },
        QUEUEING: { depth: 1 },
      },
    },
  ],
};

export { manifest, view, emitter, dataset };
