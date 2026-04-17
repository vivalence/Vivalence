import { shuffle, failedTokenIndices } from "./analysis.js";

export function routine(ctx) {
  const game = ctx.daemon.modes.game;
  const api = {
    // ── primitives ──────────────────────────────────────────────────────
    exhibit: ({ literals, layout = "TABLE", title = "", subtitle = "" } = {}) => {
      if (!literals?.length) return;
      ctx.pool.add(game.exhibit.emit.present({ layout, title, subtitle, literals }));
    },

    exhibitNew: ({ sentences, title = "New sentences", layout = "PATTERN" } = {}) => {
      const virgin = sentences.filter((sentence) => sentence.memory?.is?.virgin ?? true);
      if (!virgin.length) return;
      ctx.pool.add(game.exhibit.emit.present({ layout, title, literals: virgin }));
    },

    flashcard: (literals, { recall = "LEARNING" } = {}) => {
      if (!literals?.length) return;
      ctx.pool
        .section(
          ...shuffle(literals).map((literal) =>
            game.flashcard.emit.literals({ literal, recall }),
          ),
        )
        .apply(shuffle);
    },

    pick: ({ literal, distractors, recall = "LEARNING" }) =>
      ctx.pool.add(game.pick.emit.literal({ literal, distractors, recall })),

    pickFromPool: (items, distractors, { recall = "LEARNING" } = {}) => {
      if (!items?.length) return;
      ctx.pool
        .section(
          ...items.map((literal) =>
            game.pick.emit.literal({ literal, distractors, recall }),
          ),
        )
        .apply(shuffle);
    },

    match: ({ literals, gameplay = "TRANSLATE", recall = "LEARNING" }) => {
      if (!literals || literals.length < 2) return;
      ctx.pool.add(game.match.emit.batch({ literals, gameplay, recall }));
    },

    paradigmFill: ({ conjugation, recall = "LEARNING", feedback = "realtime", order = "ordered" }) =>
      ctx.pool.add(game.paradigm.emit.conjugation({ conjugation, recall, feedback, order })),

    shadow: (sentence, { rate = "SLOW", recall = "LEARNING" } = {}) =>
      ctx.pool.add(game.shadow.emit.literals({ literal: sentence, recall, speed: { rate } })),

    write: (literal, { recall = "LEARNING" } = {}) =>
      ctx.pool.add(game.write.emit.literals({ literal, recall })),

    listen: (literal, { gameplay = "TYPE", recall = "LEARNING" } = {}) =>
      ctx.pool.add(game.listen.emit.literal({ literal, gameplay, recall })),

    cloze: (sentence, blankIndices, { gameplay = "TYPE", recall = "LEARNING" } = {}) => {
      if (!blankIndices?.length) return;
      ctx.pool.add(
        game.cloze.emit.literal({ literal: sentence, blankIndices, gameplay, recall }),
      );
    },

    conjugate: (literals) => {
      if (!literals?.length) return;
      ctx.pool
        .section(
          ...shuffle(literals).map((literal) => game.conjugation.emit.literal({ literal })),
        )
        .apply(shuffle);
    },

    judgeFast: (items, distractors) => {
      if (!items?.length) return;
      ctx.pool
        .section(
          ...shuffle(items).map((literal) =>
            game.judge.emit.literal({ literal, distractors, speed: { rate: "FAST" } }),
          ),
        )
        .apply(shuffle);
    },
  };

  // ── compound pedagogical routines ─────────────────────────────────────

  api.familiarize = (items, { title = "", subtitle = "", layout } = {}) => {
    const isParadigm = items[0]?.paradigm != null;
    const forms = isParadigm ? items.flatMap((item) => item.forms) : items;
    api.exhibit({
      literals: forms,
      layout: layout ?? (isParadigm ? "PATTERN" : "TABLE"),
      title,
      subtitle,
    });
    if (isParadigm) {
      for (const item of items) api.paradigmFill({ conjugation: item.paradigm });
    } else {
      api.flashcard(forms);
    }
  };

  api.clozeInContext = async (forms, { maxPerForm = 1 } = {}) => {
    if (!forms?.length) return;
    const formSlugs = new Set(forms.map((form) => form.slug));
    const sentences = await ctx.daemon.entities.literal.find(
      { ontology: "sentence", uses: { $in: forms.map((form) => form.id) } },
      { limit: forms.length * 4, populate: ["uses"] },
    );
    const countPerForm = new Map();
    for (const sentence of sentences) {
      const tokens = sentence.trait?.ANNOTATED?.tokens ?? [];
      const firstBlank = tokens.findIndex((token) => token.literal && formSlugs.has(token.literal));
      if (firstBlank === -1) continue;
      const slug = tokens[firstBlank].literal;
      const count = countPerForm.get(slug) ?? 0;
      if (count >= maxPerForm) continue;
      countPerForm.set(slug, count + 1);
      api.cloze(sentence, [firstBlank]);
    }
  };

  api.produce = async (items, { distractors, withContext = true } = {}) => {
    const isParadigm = items[0]?.paradigm != null;
    const forms = isParadigm ? items.flatMap((item) => item.forms) : items;
    api.pickFromPool(forms, distractors ?? forms);
    if (withContext) await api.clozeInContext(forms);
    for (const literal of shuffle(forms).slice(0, 1)) api.write(literal);
  };

  api.reinforce = async (items) => {
    const isParadigm = items[0]?.paradigm != null;
    const forms = isParadigm ? items.flatMap((item) => item.forms) : items;
    await api.clozeInContext(forms);
    for (const literal of shuffle(forms).slice(0, 1)) api.write(literal);
  };

  api.stress = (items, { distractors } = {}) => {
    const isParadigm = items[0]?.paradigm != null;
    const forms = isParadigm ? items.flatMap((item) => item.forms) : items;
    for (const literal of shuffle(forms).slice(0, 2)) api.write(literal);
    api.judgeFast(shuffle(forms).slice(0, 2), distractors ?? forms);
  };

  api.contextualizeSentence = (sentence) => {
    const needsShadow = (sentence.memory?.is?.virgin ?? true) || sentence.memory?.is?.failed;
    if (needsShadow) api.shadow(sentence);
    else api.write(sentence);
    if (sentence.traits?.includes("VOCALIZED")) api.listen(sentence);
  };

  api.errorCloze = (sentences) => {
    for (const sentence of sentences) {
      const blankIndices = failedTokenIndices(sentence);
      if (blankIndices.length) api.cloze(sentence, blankIndices);
    }
  };

  return api;
}
