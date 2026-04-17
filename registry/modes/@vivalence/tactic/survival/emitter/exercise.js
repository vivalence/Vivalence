import { array } from "@vivalence/typology";

export default async (ctx) => {
  const game = ctx.daemon.modes.game;
  const where = { ontology: "sentence", ...ctx.input.where };
  const opts = { blacklist: ctx.input.blacklist, populate: ["uses.memories"] };

  const [sentences, errorSentences] = await Promise.all([
    ctx.daemon.entities.literal.feed(where, { ...opts, limit: ctx.input.limit ?? 3 }),
    ctx.daemon.entities.literal.byLastSignal(["MISTAKE", "FAILURE"], where, { ...opts, limit: 3 }),
  ]);
  if (!sentences.length) return;

  // ── exhibit new (virgin) sentences ────────────────────────────────
  const virgin = sentences.filter((sentence) => sentence.memory?.is?.virgin ?? true);
  if (virgin.length) {
    ctx.pool.add(
      game.exhibit.emit.present({ layout: "PATTERN", title: "New sentences", literals: virgin }),
    );
  }

  // ── shuffled body: practice + error cloze ─────────────────────────
  ctx.pool
    .section(
      ...sentences.map((sentence) => {
        const needsShadow = (sentence.memory?.is?.virgin ?? true) || sentence.memory?.is?.failed;
        if (sentence.traits?.includes("VOCALIZED")) {
          return game.listen.emit.literal({
            literal: sentence,
            gameplay: needsShadow ? "PICK" : "TYPE",
            recall: "LEARNING",
          });
        }
        return needsShadow
          ? game.shadow.emit.literals({
              literal: sentence,
              recall: "LEARNING",
              speed: { rate: "SLOW" },
            })
          : game.write.emit.literals({ literal: sentence, recall: "LEARNING" });
      }),
      ...errorSentences.flatMap((sentence) => {
        const blankIndices = failedTokenIndices(sentence);
        if (!blankIndices.length) return [];
        return [
          game.cloze.emit.literal({
            literal: sentence,
            blankIndices,
            gameplay: "TYPE",
            recall: "LEARNING",
          }),
        ];
      }),
    )
    .apply(array.shuffle);
};

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
