import { Scope, Blacklist } from "@vivalence/typology";
import { array } from "@vivalence/shared";

export default async function provision(inputs, ctx) {
  const { tactic, scope, blacklist } = inputs;
  const { games, tags } = tactic.relations;

  if (!tags.scope?.length > 0) return [];
  // // if no units pending, send signal 'faulty tactic config'.
  const unitIds = new Set();
  for (const tag of tags.scope) {
    // console.log(tag);
    await tag.units.init();
    for (const unit of tag.units) {
      unitIds.add(unit.id);
    }
  }
  const units = await ctx.runtime.call("/pick/unit/byStrength", {
    unitIds: Array.from(unitIds),
    take: tactic.masks.reps,
  });

  // if (tactic.masks.threshold) query.status = tactic.masks.threshold;

  const flashcards = await games.flashcards //
    .call("/provision/fromUnits", { units });
  return flashcards;
}
