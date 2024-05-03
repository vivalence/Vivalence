import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
    try {
        const { tagIds, blacklist = [], take } = await request.json();

        const params = {
            tag_ids: tagIds,
            blacklist: blacklist.length > 0 ? blacklist : null
        };
        if (take) params.take_limit = take;
        // console.log("params", params);

        const { data, error: unitsError } = await locals.supabase.rpc(
            "get_units_from_tag_ids",
            params
        );
        if (unitsError) throw unitsError;
        // console.log("data", data);

        const units = await Promise.all(
            data.map(async (unit) => {
                const { data, error } = await locals.supabase
                    .from("_TagToUnit")
                    .select("*, Tag: B (*)")
                    .in("A", unit.id);
                unit.tags = data.map(({ Tag }) => Tag);
                return unit;
            })
        );
        // console.log("units", units);

        return json({ data: units, error: null });
    } catch (err) {
        console.error(`[ERROR] /api/units/fromTagIds:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
