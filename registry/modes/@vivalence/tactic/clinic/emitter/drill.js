import { shuffle } from "./tools.js";
// ── sub-emitter: drill ─────────────────────────────────────────────
// active production. adapts game modes to phase context.
// input: { items, distractors?, phase? }
// phase context: FAMILIARIZE=recognition, EXPAND=production, CONSOLIDATE=transfer

export default async (ctx) => {
  const { items, distractors, phase } = ctx.input;
  if (!items?.length) return;

  const game = ctx.daemon.modes.game;
  const isParadigm = items[0]?.paradigm != null;
  const forms = isParadigm ? items.flatMap((d) => d.forms) : items;

  if (isParadigm) {
    // cloze from sentences containing conjugated forms (max 2 per form)
    if (phase !== "FAMILIARIZE") {
      const countPerForm = new Map();
      const sentences = await ctx.daemon.entities.literal.find(
        { ontology: "sentence", uses: { $in: forms.map((f) => f.id) } },
        { limit: forms.length * 4, populate: ["uses"] },
      );
      for (const sentence of sentences) {
        const raw = sentence.trait?.ANNOTATED?.tokens ?? [];
        const formIds = new Set(forms.map((f) => f.id));
        const firstBlank = raw.findIndex((token) => token.literal && formIds.has(token.literal));
        if (firstBlank === -1) continue;
        const matchedId = raw[firstBlank].literal;
        const count = countPerForm.get(matchedId) ?? 0;
        if (count >= 1) continue;
        countPerForm.set(matchedId, count + 1);
        ctx.pool.add(game.cloze.emit.literal({ literal: sentence, blankIndices: [firstBlank], gameplay: "TYPE", recall: "LEARNING" }));
      }
    }
  } else {
    const pool = distractors ?? forms;

    // pick — recognition, always useful
    ctx.pool
      .section(
        ...forms.map((literal) =>
          game.pick.emit.literal({
            literal,
            distractors: pool.filter((f) => f.id !== literal.id),
            recall: "LEARNING",
          }),
        ),
      )
      .apply(shuffle);

    // cloze — production in context, max 1 per form
    const sentences = await ctx.daemon.entities.literal.find(
      { ontology: "sentence", uses: { $in: forms.map((f) => f.id) } },
      { limit: forms.length * 4, populate: ["uses"] },
    );
    const countPerForm = new Map();
    for (const sentence of sentences) {
      const raw = sentence.trait?.ANNOTATED?.tokens ?? [];
      const formSlugs = new Set(forms.map((f) => f.slug));
      const firstBlank = raw.findIndex((token) => token.literal && formSlugs.has(token.literal));
      if (firstBlank === -1) continue;
      const matchedSlug = raw[firstBlank].literal;
      const count = countPerForm.get(matchedSlug) ?? 0;
      if (count >= 1) continue;
      countPerForm.set(matchedSlug, count + 1);
      ctx.pool.add(game.cloze.emit.literal({ literal: sentence, blankIndices: [firstBlank], gameplay: "TYPE", recall: "LEARNING" }));
    }
  }

  const writeItems = shuffle(forms).slice(0, 1);
  ctx.pool
    .section(...writeItems.map((literal) => game.write.emit.literals({ literal, recall: "LEARNING" })))
    .apply(shuffle);
};
