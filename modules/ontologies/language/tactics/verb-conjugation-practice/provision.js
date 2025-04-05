import { Blacklist, array } from "@vivalence/shared";

export default async (inputs, ctx) => {
  const { tactic, scope } = inputs;
  const { games, units, tags } = tactic.relations;
  const blacklist = new Blacklist(inputs.blacklist);
  const language = ctx.runtime.statics.language;

  const [[verb], [tense], [mood], [aspect]] = await Promise.all([
    ctx.runtime.call("/pick/tags/byStrength", {
      tags: tags.verbs,
      blacklist: tactic.masks.apply_blacklist?.verbs && blacklist,
    }),
    ctx.runtime.call("/pick/tags/byStrength", { tags: tags.tenses }),
    ctx.runtime.call("/pick/tags/byStrength", { tags: tags.moods }),
    ctx.runtime.call("/pick/tags/byStrength", { tags: tags.aspects }),
  ]);
  if (!verb || !tense || !mood || !aspect) return []; // add some <empty> instruction here.

  // CONJUGATIONS
  let conjugations = [];
  // if (verb passes tactc.masks.conjugations.threshold)
  const [conjugation] = await games.conjugations.call("/provision", {
    tags: { mood, tense, verb, aspect },
    blacklist,
  });
  blacklist.fromScope(conjugation.scope);
  conjugations.push(conjugation);

  // TRANSLATIONS
  const translations = [];
  const verbUnits = await ctx.runtime.call("/pick/units/byStrength", {
    unitIds: conjugation.scope.units.map((unit) => unit.id), // tagIds: [verb.id, tense.id, mood.id, aspect.id],
    take: tactic.masks.translations.reps,
  });
  let vocabulary = await ctx.runtime.call("/pick/units/pending", {
    scope: { ...scope, game: { id: games.translations.id } },
    blacklist,
    tagIds: [tags.vocabulary.id, tags.nouns.id],
    take: 5 + verbUnits.length,
  });
  for (const unit of verbUnits) {
    const constraints = [];
    constraints.push(
      `VERB: ${language.learning}='${unit.data.learning}' - ${language.known}='${unit.data.known}'`,
    );
    [tense, mood, aspect].map((t) => constraints.push(t.name));
    constraints.push(
      `NOUN: In case of ser/estar, chose a noun that highlights the lasting/temporary aspect of the verb.`,
    );
    const format = (unit) =>
      `Possible ${tags.nouns.name}: ${unit.data.learning} - ${unit.data.known}`;
    constraints.push(vocabulary.map(format));

    const [translation] = await games.translations.call(`/provision`, { constraints });

    translations.push(translation);
    blacklist.fromScope(translation.scope);
    vocabulary = vocabulary.filter(
      (unit) => !translation.scope.units.map((unit) => unit.id).includes(unit.id),
    );
  }

  // FLASHCARDS
  let weakUnits = [
    translations.map(({ scope }) => scope.units.map((unit) => unit.id)).flat(),
    conjugations.map(({ scope }) => scope.units.map((unit) => unit.id)).flat(),
  ].map((unitIds) =>
    ctx.runtime.call("/pick/units/byStatus", {
      status: tactic.masks.flashcards.threshold,
      unitIds,
      blacklist: inputs.blacklist,
    }),
  );
  weakUnits = await Promise.all(weakUnits);
  weakUnits = array.shuffle(weakUnits.flat()).slice(0, tactic.masks.flashcards.reps);
  const flashcards = await games.flashcards.call("/provision/fromUnits", { units: weakUnits });

  return [array.shuffle(flashcards), conjugations, array.shuffle(translations)].flat();
};
