import fromScope from "./fromScope.js";

export default async function fromQueue({ blacklist, scope }, ctx) {
  blacklist = { units: [], tags: [], ...blacklist };
  let query = ctx.runtime.services.supabase
    .from("Queue")
    .select("id, runtimeId, userId, dependencyId, gameId, tacticId, data")
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (scope.queue) query = query.eq("id", scope.queue.id);
  if (scope.dependency) query = query.eq("dependencyId", scope.dependency.id);
  if (scope.tactic) query = query.eq("tacticId", scope.tactic.id);
  if (scope.game) query = query.eq("gameId", scope.game.id);
  if (scope.user) query = query.eq("userId", scope.user.id);

  const { data: queue = [], error } = await query;
  if (error) throw error;

  queue.map((instruction) => {
    if (instruction.data.type !== "SIGNAL")
      blacklist = fromScope({ blacklist, scope: instruction.data.scope });
  });

  return fromScope({ blacklist, scope });
}
