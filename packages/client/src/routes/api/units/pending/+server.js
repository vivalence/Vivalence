import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
    try {
        const {
            gameId,
            tagIds,
            blacklist = [],
            due_lt = new Date().toISOString(),
            take = 1
        } = await request.json();

        let debt = -take;
        const units = [];

        for (const methodname of methods) {
            if (debt >= 0) break;

            const params = {
                tag_ids: tagIds,
                game_id: gameId,
                blacklist: blacklist.length > 0 ? blacklist : null,
                take_limit: Math.abs(debt)
            };

            const { data, error } = await locals.supabase.rpc(methodname, params);

            if (error) throw error;
            if (data.length === 0) continue;

            units.push(...data);
            debt += data.length;
        }

        return json({ data: units, error: null });
    } catch (err) {
        console.error(`[ERROR] /api/units/pending:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
