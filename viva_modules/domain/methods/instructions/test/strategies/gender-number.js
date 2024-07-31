export default async (context, runtime) => {
  const { language, tactic, games, units, tags } = context;
  // console.log(games, units, tags);
  const FLASHCARD_COUNT = 5;

  const articleUnits = await runtime.call("/units/weakest/fromTagIds", {
    tagIds: tags.articles.map((t) => t.id),
    take: 1,
  });
  const flashcards = await games.flashcards.call("/provision/fromUnits", {
    units: articleUnits,
  });
  console.log("flashcards", flashcards);

  // const flashcards = await locals .ontology("games/flashcards/generate/fromUnitIds", {unitIds: [...filteredTranslationUnits, ...flashcardUnits].map((u) => u.id),})
  //
  // TRANSLATIONS
  //
  // const constraints = [`ARTICLE: ${articleUnit.data[language.learning]} - ${articleUnit.data[language.spoken]}`, `LENGTH: between 4-7 words.`,]; for (const tag of vocabularyTags) {const units = await runtime .call("/units/pending", {gameId: translationsGame.id, tagIds: [structuralTag.id, tag.id], blacklist: blacklist.units, take: 4,}) units.forEach((unit) => {constraints.push(`${tag.data["ONTOLOGICAL"].leaf}: ${unit.data[language.learning]} - ${unit.data[language.spoken]}`);});}

  // const translations = await runtime .call(`/games/translations/generate`, {constraints, language, gameId: translationsGame.id,}) .ok(); locals.scopeToBlacklist({ blacklist, scope: translations.scope });

  //
  // FLASHCARDS
  //
  // const filteredTranslationUnits = await locals .client("memory/filter/units", {units: translations.scope.units, accept: ["UNKNOWN", "LEARNING"],}) .ok();

  // const flashcardUnits = []; for (const tag of vocabularyTags) {const units = await locals .client("units/pending", {gameId: flashcardsGame.id, tagIds: [structuralTag.id, tag.id], blacklist: blacklist.units, take: Math.round((FLASHCARD_COUNT - filteredTranslationUnits.length) / 2),}) .ok(); flashcardUnits.push(...units);}
  // const flashcards = await locals .ontology("games/flashcards/generate/fromUnitIds", {unitIds: [...filteredTranslationUnits, ...flashcardUnits].map((u) => u.id), gameId: flashcardsGame.id,}) .ok();

  return [flashcards];
};
