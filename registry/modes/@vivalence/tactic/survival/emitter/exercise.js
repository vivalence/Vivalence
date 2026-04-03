export default async (ctx) => {
  const sentences = await ctx.daemon.entities.literal.feed(
    { ontology: "sentence", ...ctx.input.where },
    {
      limit: ctx.input.limit ?? 3,
      blacklist: ctx.input.blacklist,
      populate: ["uses.memories"],
    },
  );
  if (!sentences.length) return;

  const virgin = sentences.filter((sentence) => !sentence.memory || sentence.memory.is.virgin);

  if (virgin.length) {
    ctx.pool.add(
      ctx.daemon.modes.game.exhibit.emit.present({
        layout: "PATTERN",
        title: "New sentences",
        literals: virgin,
      }),
    );
  }

  for (const sentence of sentences) {
    const failed = !sentence.memory || sentence.memory.is.virgin || sentence.memory?.is?.failed;

    if (failed) {
      ctx.pool.add(
        ctx.daemon.modes.game.shadow.emit.literals({
          literal: sentence,
          recall: "LEARNING",
          speed: { rate: "SLOW" },
        }),
      );
    } else {
      ctx.pool.add(
        ctx.daemon.modes.game.write.emit.literals({
          literal: sentence,
          recall: "LEARNING",
        }),
      );
    }

    if (sentence.traits?.includes("VOCALIZED")) {
      ctx.pool.add(
        ctx.daemon.modes.game.listen.emit.literal({
          literal: sentence,
          gameplay: "TYPE",
          recall: "LEARNING",
        }),
      );
    }
  }

  const errorSentences = await ctx.daemon.entities.literal.byLastSignal(
    ["MISTAKE", "FAILURE"],
    { ontology: "sentence", ...ctx.input.where },
    { limit: 3, blacklist: ctx.input.blacklist, populate: ["uses.memories"] },
  );

  for (const sentence of errorSentences) {
    const failedWords = sentence.uses.getItems().filter((word) => word.memory?.is?.failed);
    if (!failedWords.length) continue;

    const tokens = sentence.trait?.ANNOTATED?.tokens ?? [];
    const failedSlugs = new Set(failedWords.map((word) => word.slug));
    const blankIndices = tokens
      .map((token, index) => ({ token, index }))
      .filter(
        ({ token }) => token.deprel !== "punct" && token.literal && failedSlugs.has(token.literal),
      )
      .map(({ index }) => index);
    if (blankIndices.length) {
      ctx.pool.add(
        ctx.daemon.modes.game.cloze.emit.literal({
          literal: sentence,
          blankIndices,
          gameplay: "TYPE",
          recall: "LEARNING",
        }),
      );
    }
  }
};
