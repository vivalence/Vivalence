import fromScope from "./fromScope.js";

export default async function fromQueue({ blacklist, scope }, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Queue")
    .select("id, runtimeId, userId, strategyId, tagId, tacticId, data")
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (scope.instruction) query = query.eq("id", scope.instruction.id);
  if (scope.tag) query = query.eq("tagId", scope.tag.id);
  if (scope.tactic) query = query.eq("tacticId", scope.tactic.id);
  if (scope.strategy) query = query.eq("strategyId", scope.strategy.id);
  if (scope.user) query = query.eq("userId", scope.user.id);

  const { data: queue = [], error } = await query;

  queue.map((instruction) => {
    if (instruction.data.type !== "SIGNAL")
      blacklist = fromScope({ blacklist, scope: instruction.data.scope });
  });

  return fromScope({ blacklist, scope });
}
