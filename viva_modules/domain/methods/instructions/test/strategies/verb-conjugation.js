export default async ({ locals, strategy, context }) => {
  const { blacklist, language } = context;
  const conjugationsGame = strategy.relations.conjugations;
  const flashcardsGame = strategy.relations.flashcards;
  const translationsGame = strategy.relations.translations;

  const tenseTag = strategy.relations.tenseTags[0];
  const moodTag = strategy.relations.moodTags[0];

  const verbTag = await locals
    .client("tags/weakest", {
      tags: strategy.relations.verbTags,
      blacklist: blacklist.tags,
      take: 1,
    })
    .single();

  //
  // CONJUGATIONS
  //
  const conjugations = await locals
    .ontology("games/conjugations/generate", {
      tags: {
        verb: { id: verbTag.id },
        tense: { id: tenseTag.id },
        mood: { id: moodTag.id },
      },
      gameId: conjugationsGame.id,
    })
    .ok();
  // locals.scopeToBlacklist({ blacklist, scope: conjugations.scope });

  //
  // TRANSLATIONS
  //
  const unit = await locals
    .client("units/weakest/fromTagIds", {
      tagIds: [verbTag.id, tenseTag.id, moodTag.id],
      blacklist,
      take: 1,
    })
    .single();

  const constraints = [];
  constraints.push(`VERB: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`);
  constraints.push(`NOUN: Be creative in your choice of noun.`);
  constraints.push(`NOUN: Don't use obvious nouns like 'estudiante'.`);
  constraints.push(
    `NOUN: In case of ser/estar, chose a noun that highlights the lasting/temporary aspect of the verb.`,
  );
  constraints.push(`GRAMMAR: Allways without the pronoun in spanish!`);

  const translations = await locals
    .ontology(`games/translations/generate`, {
      language,
      constraints,
      gameId: translationsGame.id,
    })
    .ok();

  locals.scopeToBlacklist({ blacklist, scope: translations.scope });

  //
  // FLASHCARDS
  // from translation
  const filteredTranslationUnits = await locals
    .client("memory/filter/units", {
      units: translations.scope.units,
      accept: ["UNKNOWN", "LEARNING"],
    })
    .ok();
  const translationFlashcards = await locals
    .ontology("games/flashcards/generate/fromUnitIds", {
      unitIds: filteredTranslationUnits.map((u) => u.id),
      gameId: flashcardsGame.id,
    })
    .ok();

  //
  // FLASHCARDS
  // from conjugation
  const flashcardUnits = await locals
    .client("units/fromTagIds", {
      tagIds: [verbTag.id, tenseTag.id, moodTag.id],
      blacklist: blacklist.units,
    })
    .ok();
  const filteredFlashcardUnits = await locals
    .client("memory/filter/units", {
      units: flashcardUnits,
      accept: ["UNKNOWN", "LEARNING"],
    })
    .ok();

  const flashcards = await locals
    .ontology("games/flashcards/generate/fromUnits", {
      units: filteredFlashcardUnits,
      gameId: flashcardsGame.id,
    })
    .ok();

  return [
    ...locals.shuffle([...flashcards, ...translationFlashcards]),
    conjugations,
    translations,
  ];
};
