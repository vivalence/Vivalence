import { blacklist as Blacklist, shuffle } from "@vivalence/shared";

export default async (inputs, { runtime }) => {
  const { language, tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  let blacklist = inputs.blacklist;

  const [verb] = await runtime.call("/tags/weakest", {
    tags: tags.verbs,
    blacklist,
    take: 1,
  });

  // CONJUGATIONS
  const conjugations = await games.conjugations.call("/provision", {
    tags: { mood: tags.mood, tense: tags.tense, verb },
    blacklist,
  });
  blacklist = Blacklist.fromScope({ blacklist, scope: conjugations.scope });

  // TRANSLATIONS
  const [unit] = await runtime.call("/units/weakest/fromTagIds", {
    tagIds: [verb.id, tags.tense.id, tags.mood.id],
    take: 1,
  });

  const constraints = [];
  constraints.push(`VERB: ${unit.data.learning} - ${unit.data.known}`);
  [tags.tense, tags.mood].map((t) => constraints.push(t.name));
  constraints.push(
    `NOUN: In case of ser/estar, chose a noun that highlights the lasting/temporary aspect of the verb.`,
  );
  constraints.push(`GRAMMAR: Allways without the pronoun in spanish!`);

  for (const tag of tags.vocabulary) {
    const units = await runtime.call("/units/pending", {
      scope: { ...scope, game: { id: games.translations.id } },
      blacklist,
      tagIds: [tags.structural.id, tag.id],
      take: 3,
    });
    units.forEach((unit) => {
      constraints.push(`possible "${tag.name}": "${unit.data.learning} - ${unit.data.known}"`);
    });
  }

  const translations = await games.translations.call(`/provision`, { constraints });

  blacklist = Blacklist.fromScope({ blacklist, scope: translations.scope });

  // FLASHCARDS
  // from the weakest units of translations and conjugations
  const weakUnits = await Promise.all(
    [
      [translations.scope.units, 3],
      [conjugations.scope.units, 2],
    ].map(([units, take]) =>
      runtime.call("/memory/filter/units", { accept: ["UNKNOWN", "LEARNING"], units, take }),
    ),
  );

  const flashcards = await games.flashcards.call("/provision/fromUnitIds", {
    unitIds: weakUnits.flat().map((u) => u.id),
  });

  return [...shuffle(flashcards), conjugations, translations];
};
