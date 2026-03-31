import { BufferView, Vector, array, string, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "judge",
  name: "Judge",
  description: "Timed true/false on translation pairs. Swipe or tap.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const dataset = {
  intent: [
    {
      slug: "feed",
      name: "Judge",
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

const emitter = new Vector()
  .open("/literal", async (ctx) => {
    const target = ctx.input.literal;
    const recall = ctx.input.recall ?? "LEARNING";
    const field = recall === "LEARNING" ? "known" : "learning";

    const pool =
      ctx.input.distractors ??
      (await ctx.daemon.entities.literal.feed({
        limit: 3,
        blacklist: { literals: [target.id] },
        where: { ontology: target.ontology },
      }));
    const targetText = string.fold(target.trait?.TRANSLATED?.[field] ?? "");
    const scored = [];
    for (const d of pool) {
      const t = string.fold(d.trait?.TRANSLATED?.[field] ?? "");
      if (t === targetText) continue;
      scored.push({ d, score: string.dice(targetText, t) });
    }
    scored.sort((a, b) => b.score - a.score);
    const distractor = scored[0]?.d ?? null;
    const useDistractor = distractor && Math.random() > 0.5;

    return ctx.mode.buffer({
      data: {
        recall,
        gameplay: ctx.input.gameplay ?? "visual",
        speed: ctx.input.speed ?? null,
        target: target.id,
        distractor: useDistractor ? distractor.id : null,
      },
      literals: useDistractor ? [target, distractor] : [target],
    });
  })
  .open("/feed", async (ctx) => {
    const limit = ctx.input.limit ?? 4;
    const literals = await ctx.daemon.entities.literal.feed({
      limit,
      blacklist: ctx.input.blacklist,
    });
    if (!literals.length) return [];

    const buffers = [];
    for (const literal of literals) {
      buffers.push(
        await ctx.mode.emit.literal({
          literal,
          recall: ctx.input.recall,
          gameplay: ctx.input.gameplay,
          speed: ctx.input.speed,
        }),
      );
    }
    return buffers;
  });

const buffer = new BufferView(
  "buffer/Judge.svelte",
  v.buffer({
    data: {
      recall: v
        .string({ default: "LEARNING" })
        .desc("LEARNING: show learning text + judge known, KNOWN: reversed"),
      gameplay: v
        .string({ default: "visual" })
        .desc("visual: text only, audio: text + audio, audio-only: audio + translation only"),
      speed: v
        .object({
          rate: v
            .string()
            .desc(
              "Preset: FAST (1500ms+80ms/char), NORMAL (2500ms+120ms/char), SLOW (3500ms+180ms/char)",
            )
            .optional(),
          base: v
            .number()
            .desc(
              "Base time in ms. Overrides preset base. With multiplier=0, acts as absolute time.",
            )
            .optional(),
          multiplier: v
            .number()
            .desc(
              "Extra ms per character of shown text. Absent = use preset. 0 = base is absolute.",
            )
            .optional(),
        })
        .desc("Per-item timing. Computed as base + shown.length × multiplier.")
        .optional(),
      target: v.string().desc("Literal ID of the target"),
      distractor: v
        .string()
        .desc("Literal ID of the distractor (wrong pairing), or null if correct pairing")
        .optional(),
    },
  }),
);

export { manifest, buffer, emitter, dataset };
