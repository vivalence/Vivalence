// ── exercise ────────────────────────────────────────────────────────
// deep sentence work. graph-powered token resolution.
// adaptive cloze: blank producible words, scaffold the rest.

export default async (ctx) => {
  const sentences = await ctx.daemon.entities.literal.feed({
    limit: ctx.input.limit ?? 3,
    blacklist: ctx.input.blacklist,
    where: ctx.input.where,
    populate: ["uses.memories"],
  });
  if (!sentences.length) return [];

  const buffers = [];


  // ── distractor pool: one fetch, shared across all game emits ──────
  const distractors = await ctx.daemon.entities.literal.find(ctx.input.where ?? {}, { limit: 30 });

  // ── resolve tokens via graph ──────────────────────────────────────
  const sentenceTokens = sentences.map((sentence) => {
    const raw = sentence.trait?.ANNOTATED?.tokens ?? [];
    const usedWords = sentence.uses.isInitialized() ? sentence.uses.getItems() : [];
    const bySlug = new Map(usedWords.map((word) => [word.slug, word]));

    const tokens = raw
      .filter((token) => token.literal && token.deprel !== "punct")
      .map((token) => bySlug.get(token.literal))
      .filter(Boolean);

    return { sentence, tokens, raw };
  });

  const seen = new Set();
  const untouchedWords = [];
  const unknownWords = [];
  const learningWords = [];

  for (const { tokens } of sentenceTokens) {
    for (const tok of tokens) {
      if (seen.has(tok.id)) continue;
      seen.add(tok.id);
      if (!tok.memory || tok.memory.is.virgin) untouchedWords.push(tok);
      else if (tok.memory.status === "UNKNOWN") unknownWords.push(tok);
      else if (tok.memory.status === "LEARNING") learningWords.push(tok);
    }
  }

  // ── exhibit untouched sentences
  const untouchedSentences = sentences.filter(
    (sentence) => !sentence.memory || sentence.memory.is.virgin,
  );
  if (untouchedSentences.length) {
    buffers.push(
      await ctx.daemon.modes.game.exhibit.emit.present({
        layout: "pattern",
        title: "New sentences",
        literals: untouchedSentences,
      }),
    );
  }

  // ── exhibit untouched words
  if (untouchedWords.length) {
    buffers.push(
      await ctx.daemon.modes.game.exhibit.emit.present({
        layout: "table",
        title: "New words",
        literals: untouchedWords,
      }),
    );
  }

  // ── shadow sentences
  for (const { sentence } of sentenceTokens) {
    buffers.push(
      await ctx.daemon.modes.game.shadow.emit.literals({
        literal: sentence,
        recall: "KNOWN",
        speed: { rate: "SLOW" },
      }),
    );
  }

  // ── adaptive cloze: blank producible words ────────────────────────
  // blank LEARNING/KNOWN words — the learner should be able to produce these.
  // leave UNTOUCHED/UNKNOWN visible as scaffolding.
  const blankable = new Set();
  for (const { tokens } of sentenceTokens) {
    for (const tok of tokens) {
      if (tok.memory?.status === "LEARNING" || tok.memory?.is?.strong) blankable.add(tok.slug);
    }
  }

  for (const { sentence, raw } of sentenceTokens) {
    const blankIndices = raw
      .map((token, index) => ({ token, index }))
      .filter(({ token }) => token.deprel !== "punct" && token.literal && blankable.has(token.literal))
      .map(({ index }) => index);

    if (blankIndices.length) {
      buffers.push(
        await ctx.daemon.modes.game.cloze.emit.literal({
          literal: sentence,
          blankIndices,
          gameplay: "type",
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── judge unknown (normal speed) + learning (fast)
  for (const literal of unknownWords) {
    buffers.push(
      await ctx.daemon.modes.game.judge.emit.literal({
        literal,
        distractors,
        recall: "LEARNING",
        speed: { rate: "NORMAL" },
      }),
    );
  }
  for (const literal of learningWords) {
    buffers.push(
      await ctx.daemon.modes.game.judge.emit.literal({
        literal,
        distractors,
        recall: "LEARNING",
        speed: { rate: "FAST" },
      }),
    );
  }

  // ── write sentences
  for (const { sentence } of sentenceTokens) {
    buffers.push(
      await ctx.daemon.modes.game.write.emit.literals({
        literal: sentence,
        recall: "LEARNING",
      }),
    );
  }

  // ── listen(type) sentences
  for (const { sentence } of sentenceTokens) {
    if (sentence.traits?.includes("VOCALIZED")) {
      buffers.push(
        await ctx.daemon.modes.game.listen.emit.literal({
          literal: sentence,
          gameplay: "type",
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── listen(pick) untouched/unknown words
  for (const literal of [...untouchedWords, ...unknownWords]) {
    if (literal.traits?.includes("VOCALIZED")) {
      buffers.push(
        await ctx.daemon.modes.game.listen.emit.literal({
          literal,
          distractors,
          gameplay: "pick",
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── listen(type) learning words
  for (const literal of learningWords) {
    if (literal.traits?.includes("VOCALIZED")) {
      buffers.push(
        await ctx.daemon.modes.game.listen.emit.literal({
          literal,
          gameplay: "type",
          recall: "LEARNING",
        }),
      );
    }
  }

  return buffers;
};
