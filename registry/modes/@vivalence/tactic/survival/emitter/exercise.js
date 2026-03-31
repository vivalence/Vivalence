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
  const modes = ctx.daemon.modes.game;

  // ── resolve tokens via graph ──────────────────────────────────────
  const sentenceTokens = sentences.map((sentence) => {
    const raw = sentence.trait?.ANNOTATED?.tokens ?? [];
    const usedWords = sentence.uses.isInitialized() ? sentence.uses.getItems() : [];
    const bySlug = new Map(usedWords.map((w) => [w.slug, w]));

    const tokens = raw
      .filter((t) => t.literal && t.deprel !== "punct")
      .map((t) => bySlug.get(t.literal))
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
      const status = tok.memory?.status;
      if (!status || status === "UNTOUCHED") untouchedWords.push(tok);
      else if (status === "UNKNOWN") unknownWords.push(tok);
      else if (status === "LEARNING") learningWords.push(tok);
    }
  }

  // ── exhibit untouched sentences
  const untouchedSentences = sentences.filter(
    (s) => !s.memory || s.memory.status === "UNTOUCHED",
  );
  if (untouchedSentences.length) {
    buffers.push(
      await modes.exhibit.emit.present({
        layout: "pattern",
        title: "New sentences",
        literals: untouchedSentences,
      }),
    );
  }

  // ── exhibit untouched words
  if (untouchedWords.length) {
    buffers.push(
      await modes.exhibit.emit.present({
        layout: "table",
        title: "New words",
        literals: untouchedWords,
      }),
    );
  }

  // ── shadow sentences
  for (const { sentence } of sentenceTokens) {
    buffers.push(
      await modes.shadow.emit.literals({
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
      const status = tok.memory?.status;
      if (status === "LEARNING" || status === "KNOWN") blankable.add(tok.slug);
    }
  }

  for (const { sentence, raw } of sentenceTokens) {
    const blankIndices = raw
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t.deprel !== "punct" && t.literal && blankable.has(t.literal))
      .map(({ i }) => i);

    if (blankIndices.length) {
      buffers.push(
        await modes.cloze.emit.literal({
          literal: sentence,
          blankIndices,
          gameplay: "type",
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── judge unknown (normal speed) + learning (fast)
  for (const lit of unknownWords) {
    buffers.push(
      await modes.judge.emit.literal({
        literal: lit,
        recall: "LEARNING",
        speed: { rate: "NORMAL" },
      }),
    );
  }
  for (const lit of learningWords) {
    buffers.push(
      await modes.judge.emit.literal({
        literal: lit,
        recall: "LEARNING",
        speed: { rate: "FAST" },
      }),
    );
  }

  // ── write sentences
  for (const { sentence } of sentenceTokens) {
    buffers.push(
      await modes.write.emit.literals({
        literal: sentence,
        recall: "LEARNING",
      }),
    );
  }

  // ── listen(type) sentences
  for (const { sentence } of sentenceTokens) {
    if (sentence.traits?.includes("VOCALIZED")) {
      buffers.push(
        await modes.listen.emit.literal({
          literal: sentence,
          gameplay: "type",
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── listen(pick) untouched/unknown words
  for (const lit of [...untouchedWords, ...unknownWords]) {
    if (lit.traits?.includes("VOCALIZED")) {
      buffers.push(
        await modes.listen.emit.literal({
          literal: lit,
          gameplay: "pick",
          recall: "LEARNING",
        }),
      );
    }
  }

  // ── listen(type) learning words
  for (const lit of learningWords) {
    if (lit.traits?.includes("VOCALIZED")) {
      buffers.push(
        await modes.listen.emit.literal({
          literal: lit,
          gameplay: "type",
          recall: "LEARNING",
        }),
      );
    }
  }

  return buffers;
};
