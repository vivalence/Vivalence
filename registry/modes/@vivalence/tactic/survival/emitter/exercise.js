import { array, random } from "@vivalence/typology";

function failedTokenIndices(sentence) {
  const failedSlugs = new Set(
    sentence.uses
      .getItems()
      .filter((word) => word.memory?.is?.failed)
      .map((word) => word.slug),
  );
  if (!failedSlugs.size) return [];
  const tokens = sentence.trait?.ANNOTATED?.tokens ?? [];
  return tokens
    .map((token, index) => ({ token, index }))
    .filter(
      ({ token }) => token.deprel !== "punct" && token.literal && failedSlugs.has(token.literal),
    )
    .map(({ index }) => index);
}

export default async (ctx) => {
  const game = ctx.daemon.modes.game;
  const where = { ontology: "sentence", ...ctx.input.where };
  const opts = { blacklist: ctx.input.blacklist, populate: ["uses.memories", "memories"] };

  const [sentences, errorSentences] = await Promise.all([
    ctx.daemon.entities.literal.feed(where, { ...opts, limit: ctx.input.limit ?? 3 }),
    ctx.daemon.entities.literal.byLastSignal(["MISTAKE", "FAILURE"], where, { ...opts, limit: 3 }),
  ]);
  if (!sentences.length) return;

  const virgin = sentences.filter((sentence) => !sentence.memory);
  for (const sentence of virgin) {
    ctx.pool.add(
      game.shadow.emit.literals({
        literal: sentence,
        recall: "LEARNING",
        speed: { rate: "SLOW" },
      }),
    );
  }

  const reviewed = sentences.filter((sentence) => sentence.memory);
  const vocalized = reviewed.filter((sentence) => sentence.traits?.includes("VOCALIZED"));
  const written = reviewed.filter((sentence) => !sentence.traits?.includes("VOCALIZED"));

  const practice = ctx.pool.section();

  for (const sentence of vocalized) {
    if (sentence.memory.is.virgin || sentence.memory.is.failed) {
      practice.add(
        game.listen.emit.literal({ literal: sentence, gameplay: "PICK", recall: "LEARNING" }),
      );
    } else if (random.coinflip(0.7)) {
      practice.add(
        game.listen.emit.literal({ literal: sentence, gameplay: "TYPE", recall: "LEARNING" }),
      );
    } else {
      practice.add(game.write.emit.literals({ literal: sentence }));
    }
  }

  for (const sentence of written) {
    if (sentence.memory.is.virgin || sentence.memory.is.failed) {
      practice.add(
        game.shadow.emit.literals({
          literal: sentence,
          recall: "LEARNING",
          speed: { rate: "SLOW" },
        }),
      );
    } else {
      practice.add(game.write.emit.literals({ literal: sentence }));
    }
  }

  for (const sentence of errorSentences) {
    const blankIndices = failedTokenIndices(sentence);
    if (!blankIndices.length) continue;
    practice.add(
      game.cloze.emit.literal({
        literal: sentence,
        blankIndices,
        gameplay: "TYPE",
        recall: "LEARNING",
      }),
    );
  }

  practice.apply(array.shuffle);
};
