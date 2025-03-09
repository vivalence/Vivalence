import fromScope from "./fromScope.js";

export default async function fromInstructionQueue({ blacklist, scope }, ctx) {
  blacklist = { units: [], tags: [], ...blacklist };

  // Build criteria object for MikroORM query
  const criteria = {
    runtime: ctx.runtime.entity.id,
  };

  // Conditionally add filters based on scope
  if (scope.queue) criteria.id = scope.queue.id;
  if (scope.dependency) criteria.dependency = scope.dependency.id;
  if (scope.tactic) criteria.tactic = scope.tactic.id;
  if (scope.game) criteria.game = scope.game.id;
  if (scope.user) criteria.user = scope.user.id;

  // Execute the MikroORM query
  const queue =
    (await ctx.runtime.entities.instruction.find(criteria, {
      fields: ["id", "runtime", "user", "dependency", "game", "tactic", "data"],
    })) || [];

  // Process instructions to update the blacklist
  queue.map((instruction) => {
    if (instruction.data.type !== "SIGNAL") {
      blacklist = fromScope({ blacklist, scope: instruction.data.scope });
    }
  });

  return fromScope({ blacklist, scope });
}
