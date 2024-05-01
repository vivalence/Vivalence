import { json } from "@sveltejs/kit";

export async function POST({ request, locals, ...props }) {
    // console.log("GET /api/tags", locals.params());
    try {
        const {
            gameId,
            blacklist = [],
            // whitelist = [],
            due_lt = new Date().toISOString(),
            take = 1
        } = await request.json();

        let debt = -take;
        const tags = [];
        for (const methodname of ["get_due_tags", "get_new_tags"]) {
            if (debt >= 0) break;
            const params = {
                game_id: gameId,
                blacklist: blacklist.length > 0 ? blacklist : null,
                whitelist: whitelist.length > 0 ? whitelist : null,
                take_limit: Math.abs(debt)
            };
            const { data, error } = await locals.supabase.rpc(methodname, params);
            if (error) throw error;
            if (data.length === 0) continue;
            tags.push(...data);
            debt += data.length;
        }
        return json({ data: tags, error: null });
    } catch (err) {
        console.error(`ERROR /api/tags GET:`, err.message);
        return json({ status: 500, error: err });
    }
}
