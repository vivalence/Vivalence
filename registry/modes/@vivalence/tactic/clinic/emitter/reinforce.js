import { shuffle } from "./tools.js";
// ── sub-emitter: reinforce ─────────────────────────────────────────
// strengthen weak items: production-focused (paradigm/cloze + write)
// input: { items }

export default async (ctx) => {
  const { items } = ctx.input;
  if (!items?.length) return;

  const game = ctx.daemon.modes.game;
  const isParadigm = items[0]?.paradigm != null;
  const forms = isParadigm ? items.flatMap((d) => d.forms) : items;

  if (isParadigm) {
    const sentences = await ctx.daemon.entities.literal.find(
      { ontology: "sentence", uses: { $in: forms.map((f) => f.id) } },
      { limit: forms.length * 3, populate: ["uses"] },
    );
    const countPerForm = new Map();
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
  } else {
    // cloze in context for word reinforcement
    const sentences = await ctx.daemon.entities.literal.find(
      { ontology: "sentence", uses: { $in: forms.map((f) => f.id) } },
      { limit: forms.length * 3, populate: ["uses"] },
    );
    const countPerForm = new Map();
    for (const sentence of sentences) {
      const raw = sentence.trait?.ANNOTATED?.tokens ?? [];
      const formSlugs = new Set(forms.map((f) => f.slug));
      const firstBlank = raw.findIndex((token) => token.literal && formSlugs.has(token.literal));
      if (firstBlank === -1) continue;
      const matchedSlug = raw[firstBlank].literal;
      const count = countPerForm.get(matchedSlug) ?? 0;
      if (count >= 1) continue; // tighter: 1 per form for reinforce
      countPerForm.set(matchedSlug, count + 1);
      ctx.pool.add(game.cloze.emit.literal({ literal: sentence, blankIndices: [firstBlank], gameplay: "TYPE", recall: "LEARNING" }));
    }
  }

  const writeItems = shuffle(forms).slice(0, 1);
  ctx.pool
    .section(...writeItems.map((literal) => game.write.emit.literals({ literal, recall: "LEARNING" })))
    .apply(shuffle);
};
