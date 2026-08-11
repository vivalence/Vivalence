import { array, random } from "@vivalence/typology";

function failedTokenIndices(sentence) {
  const failedSlugs = new Set(
    sentence.uses
      .getItems()
      .filter((word) => word.retention?.is?.failed)
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
  const opts = { blacklist: ctx.input.blacklist, populate: ["uses.retentions", "retentions"] };

  const [sentences, errorSentences] = await Promise.all([
    ctx.daemon.entities.literal.feed(where, { ...opts, limit: ctx.input.limit ?? 3 }),
    ctx.daemon.entities.literal.byLastSignal(["MISTAKE", "FAILURE"], where, { ...opts, limit: 3 }),
  ]);
  if (!sentences.length) return;

  const virgin = sentences.filter((sentence) => !sentence.retention);
  for (const sentence of virgin) {
    ctx.pool.add(
      game["rep-o-gram"].emit.shadow.literals({
        literal: sentence,
        recall: "LEARNING",
        preview: { speed: { rate: "SLOW" } },
      }),
    );
  }

  const reviewed = sentences.filter((sentence) => sentence.retention);
  const vocalized = reviewed.filter((sentence) => sentence.traits?.includes("VOCALIZED"));
  const written = reviewed.filter((sentence) => !sentence.traits?.includes("VOCALIZED"));

  const practice = ctx.pool.section();

  for (const sentence of vocalized) {
    if (sentence.retention.is.virgin || sentence.retention.is.failed) {
      practice.add(
        game["rep-o-gram"].emit.listen.literal({
          literal: sentence,
          gameplay: "PICK",
          recall: "LEARNING",
        }),
      );
    } else if (random.coinflip(0.7)) {
      practice.add(
        game["rep-o-gram"].emit.listen.literal({
          literal: sentence,
          gameplay: "TYPE",
          recall: "LEARNING",
        }),
      );
    } else {
      practice.add(game["rep-o-gram"].emit.write.literals({ literal: sentence }));
    }
  }

  for (const sentence of written) {
    if (sentence.retention.is.virgin || sentence.retention.is.failed) {
      practice.add(
        game["rep-o-gram"].emit.shadow.literals({
          literal: sentence,
          recall: "LEARNING",
          preview: { speed: { rate: "SLOW" } },
        }),
      );
    } else {
      practice.add(game["rep-o-gram"].emit.write.literals({ literal: sentence }));
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
