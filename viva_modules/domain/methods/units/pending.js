export default async function (body, runtime) {
  const { gameId, tagIds, blacklist = [], take = 1 } = body;

  let debt = -take;
  const units = [];

  for (const methodname of ["get_due_units", "get_new_units"]) {
    if (debt >= 0) break;

    const params = {
      tag_ids: tagIds,
      game_id: gameId,
      blacklist: blacklist.length > 0 ? blacklist : null,
      take_limit: Math.abs(debt),
    };

    const { data, error } = await runtime.locals.supabase.rpc(methodname, params);

    if (error) throw error;
    if (data.length === 0) continue;

    units.push(...data);
    debt += data.length;
  }

  return units;
}
