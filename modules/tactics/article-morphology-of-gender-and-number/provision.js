import { blacklist as Blacklist, shuffle } from "@vivalence/shared";

const FLASHCARD_COUNT = 5;

export default async (inputs, { runtime }) => {
  const { language, tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  let blacklist = inputs.blacklist;

  // // SCOPE //
  const [articleUnit] = await runtime.call("/units/weakest/fromTagIds", {
    tagIds: [tags.articles.id],
    blacklist,
    take: 1,
  });

  const [numberTag] = await runtime.call("/tags/weakest", {
    tags: tags.numbers,
    take: 1,
  });

  const [genderTag] = await runtime.call("/tags/weakest", {
    tags: tags.genders,
    take: 1,
  });

  // // TRANSLATIONS //
  const constraints = [];
  constraints.push(`ARTICLE to use: "${articleUnit.data.learning} - ${articleUnit.data.known}"`);
  [genderTag, numberTag].forEach((tag) =>
    constraints.push(
      `inflection must be in agreement with: "${tag.data["ONTOLOGICAL"].branch}: ${tag.data["ONTOLOGICAL"].leaf}"`,
    ),
  );
  constraints.push(`LENGTH: "Between 4-7 words."`);

  for (const tag of tags.vocabulary) {
    const units = await runtime.call("/units/pending", {
      scope: { ...scope, game: { id: games.translations.id } },
      blacklist,
      tagIds: [tags.structural.id, tag.id],
      take: 4,
    });
    units.forEach((unit) => {
      constraints.push(
        `choices of "${tag.data["ONTOLOGICAL"].leaf}": "${unit.data.learning} - ${unit.data.known}"`,
      );
    });
  }

  const translations = await games.translations.call(`/provision`, { constraints });

  blacklist = Blacklist.fromScope({ blacklist, scope: translations.scope });

  // // FLASHCARDS //
  // Flashcards: from the weakest units of translations
  const weakTranslationUnits = await runtime.call("/memory/filter/units", {
    units: translations.scope.units,
    accept: ["UNKNOWN", "LEARNING"],
  });

  const flashcardUnits = await runtime.call("/units/fromUnitIds", {
    unitIds: weakTranslationUnits.map((unit) => unit.id),
  });

  // Flashcards: from due nouns and adjectives
  for (const tag of tags.vocabulary) {
    const units = await runtime.call("/units/pending", {
      tagIds: [tags.structural.id, tag.id],
      scope: { ...scope, game: { id: games.flashcards.id } },
      blacklist,
      take: Math.round((FLASHCARD_COUNT - weakTranslationUnits.length) / tags.vocabulary.length),
    });
    flashcardUnits.push(...units);
  }

  const flashcards = await games.flashcards.call("/provision/fromUnits", { units: flashcardUnits });

  return [...shuffle(flashcards), translations];
};
