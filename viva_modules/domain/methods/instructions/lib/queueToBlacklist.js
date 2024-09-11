import { blacklist as Blacklist } from "@vivalence/shared";

export default async function queueToBlacklist({ blacklist, scope }, ctx) {
  const { data: queue = [] } = await ctx.runtime.locals.supabase
    .from("Queue")
    .select("id, userId, strategyId, tacticId, data")
    .eq("userId", scope.user.id)
    .eq("strategyId", scope.strategy.id)
    .eq("tacticId", scope.tactic.id);

  queue.map(({ data }) => {
    blacklist = Blacklist.fromScope({ blacklist, scope: data.scope });
  });

  return Blacklist.fromScope({ blacklist, scope });
}
