export default async function (body, ctx) {
  const { gameId, tagIds, take = 1, blacklist = [] } = body;
  let debt = -take;

  const tags = [];
  for (const methodname of ["get_due_tags", "get_new_tags"]) {
    if (debt >= 0) break;
    const params = {
      game_id: gameId,
      tagIds: tagIds.length > 0 ? tagIds : null,
      blacklist: blacklist.length > 0 ? blacklist : null,
      take_limit: Math.abs(debt),
    };
    const { data, error } = await ctx.runtime.locals.supabase.rpc(methodname, params);
    if (error) throw error;
    if (data.length === 0) continue;
    tags.push(...data);
    debt += data.length;
  }

  return tags;
}
