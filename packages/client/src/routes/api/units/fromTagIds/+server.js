import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
    try {
        const { tagIds, gameId, blacklist = [], take } = await request.json();

        const units = [];
        const params = {
            tag_ids: tagIds,
            blacklist: blacklist.length > 0 ? blacklist : null
        };
        if (take) params.take_limit = take;

        const { data: units, error } = await locals.supabase.rpc("get_units_from_tag_ids", params);
        if (error) throw error;

        return json({ data: units, error: null });
    } catch (err) {
        console.error(`[ERROR] /api/units/fromTagIds:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
