import { blacklist as Blacklist, array } from "@vivalence/shared";

export default async function provision(inputs, ctx) {
  const { tactic, scope } = inputs;
  const { games, tags } = tactic.relations;
  let blacklist = inputs.blacklist;

  if (!tags.scope?.length > 0) return [];
  // if no units pending, send signal 'faulty tactic config'.

  const query = {
    tagIds: tags.scope.map((tag) => tag.id),
    blacklist,
    scope,
  };

  if (tactic.masks.reps) query.take = tactic.masks.reps;
  // if (tactic.masks.threshold) query.status = tactic.masks.threshold;

  const units = await ctx.runtime.call("/pick/units/pending", query);
  // if no units pending, send signal 'no due units'.
  // user whould be able to chose: continue practice / next tactic.

  const flashcards = await games.flashcards.call("/provision/fromUnits", { units });
  return flashcards;
}
