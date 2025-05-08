import { Scope, Blacklist, array } from "@vivalence/shared";

export default async function provision(inputs, ctx) {
  const blacklist = new Blacklist(inputs.blacklist);
  const scope = new Scope(inputs.scope);
  const language = ctx.runtime.statics.language;
  const { games, tags } = inputs.tactic.relations;

  const units = await ctx.runtime.call("/pick/units/pending", {
    tagIds: [],
    take: 5 * inputs.tactic.masks.reps,
    scope: { ...scope, game: { id: games.translations.id } },
    blacklist,
  });

  const translations = [];
  const [translation] = await games.translations.call("/provision", {
    constraints,
  });
  if (translation) {
    translations.push(translation);
    blacklist.fromScope(translation.scope);
  }

  // const allUnitIds = translations.map(({ scope }) => scope.units.map((unit) => unit.id)).flat();
  // const weakUnits = await ctx.runtime.call("/pick/units/byStatus", {status: tactic.masks.flashcards.threshold, unitIds: allUnitIds, blacklist, take: tactic.masks.flashcards.reps || 4,});
  // const flashcards = await games.flashcards.call("/provision/fromUnits", {units: weakUnits,});

  // return array.shuffle([...translations, ...flashcards]);
}
