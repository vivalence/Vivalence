import { Blacklist, array } from "@vivalence/shared";

export default async function provision(inputs, ctx) {
  const { tactic, scope, blacklist } = inputs;
  const { games, tags } = tactic.relations;

  if (!tags.scope?.length > 0) return [];
  // if no units pending, send signal 'faulty tactic config'.

  const query = {
    tagIds: tags.scope.map((tag) => tag.id),
    blacklist,
    scope,
  };

  if (tactic.masks.reps) query.take = tactic.masks.reps;
  // if (tactic.masks.threshold) query.status = tactic.masks.threshold;

  const units = await ctx.runtime.call("/pick/unit/pending", query);
  // if no units pending, send signal 'no due units'.
  // user whould be able to chose: continue practice / next tactic.

  // console.log(JSON.stringify({ units }));
  const flashcards = await games.flashcards.call("/provision/fromUnits", { units });
  // console.log("flashcards ", flashcards);
  return flashcards;
}
