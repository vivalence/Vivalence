import { json } from "@sveltejs/kit";

export async function POST({ request, locals, ...props }) {
  try {
    const { gameId, tagIds, take = 1, blacklist = [] } = await request.json();
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
      const { data, error } = await locals.supabase.rpc(methodname, params);
      if (error) throw error;
      if (data.length === 0) continue;
      tags.push(...data);
      debt += data.length;
    }

    return json({ data: tags, error: null });
  } catch (err) {
    console.error(`ERROR /api/tags/pending:\n`, err.message);
    console.error(err);
    return json({ status: 500, error: err });
  }
}
