export default async ({ locals, strategy, context }) => {
  const { blacklist, language } = context;
  const FLASHCARD_COUNT = 5;

  const translationsGame = strategy.relations.translations;
  const flashcardsGame = strategy.relations.flashcards;

  const structuralTag = strategy.relations.structuralTags[0];
  const vocabularyTags = strategy.relations.vocabularyTags;
  const articleTags = strategy.relations.articleTags;

  const articleUnit = await locals
    .client("units/weakest/fromTagIds", {
      tagIds: articleTags.map((t) => t.id),
      take: 1,
    })
    .single();

  //
  // TRANSLATIONS
  //
  const constraints = [
    `ARTICLE: ${articleUnit.data[language.learning]} - ${articleUnit.data[language.spoken]}`,
    `LENGTH: between 4-7 words.`,
  ];

  for (const tag of vocabularyTags) {
    const units = await locals
      .client("units/pending", {
        gameId: translationsGame.id,
        tagIds: [structuralTag.id, tag.id],
        blacklist: blacklist.units,
        take: 4,
      })
      .ok();

    units.forEach((unit) => {
      constraints.push(
        `${tag.data["ONTOLOGICAL"].leaf}: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`,
      );
    });
  }

  const translations = await locals
    .ontology(`games/translations/generate`, {
      constraints,
      language,
      gameId: translationsGame.id,
    })
    .ok();

  locals.scopeToBlacklist({ blacklist, scope: translations.scope });

  //
  // FLASHCARDS
  //
  const filteredTranslationUnits = await locals
    .client("memory/filter/units", {
      units: translations.scope.units,
      accept: ["UNKNOWN", "LEARNING"],
    })
    .ok();

  const flashcardUnits = [];
  for (const tag of vocabularyTags) {
    const units = await locals
      .client("units/pending", {
        gameId: flashcardsGame.id,
        tagIds: [structuralTag.id, tag.id],
        blacklist: blacklist.units,
        take: Math.round((FLASHCARD_COUNT - filteredTranslationUnits.length) / 2),
      })
      .ok();
    flashcardUnits.push(...units);
  }

  const flashcards = await locals
    .ontology("games/flashcards/generate/fromUnitIds", {
      unitIds: [...filteredTranslationUnits, ...flashcardUnits].map((u) => u.id),
      gameId: flashcardsGame.id,
    })
    .ok();

  return [...locals.shuffle(flashcards), translations];
};
