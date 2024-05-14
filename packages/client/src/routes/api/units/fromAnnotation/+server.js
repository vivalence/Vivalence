import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
    try {
        const { annotation } = await request.json();
        if (["punct", "space", "sym", "adp", "x"].includes(annotation.pos)) {
            return json({ data: null, status: 200 });
        }

        const userId = (await locals.getSession()).user.id;

        let query = locals.supabase
            .from("Unit")
            .select(`*, _TagToUnit(*, Tag: A (*))`)
            .eq("data->annotation->>lemma", annotation.lemma);
        // .eq("objectStatus", "ACTIVE");

        const filterTags = Object.keys(annotation)
            .filter((key) => !["token", "lemma"].includes(key))
            .filter((key) => annotation[key]);
        // .filter((key) => ({ [key]: annotation[key] })); doesnt work because of how the tags models ontological data. @lj

        query = query
            .in("_TagToUnit.Tag.data->ONTOLOGICAL->>leaf", filterTags)
            .not("_TagToUnit.Tag", "is", null);

        const { data, error } = await query;
        if (error) throw error;

        const units = data.filter((u) => u._TagToUnit.length === filterTags.length);
        console.log("units from annotation", units);
        console.log("SHOULD NEVER BE OTHER THAN 1", units.length);
        // log if units.length anything other than 1

        const unit = units.find((u) => u._TagToUnit.length === filterTags.length);
        if (unit) {
            unit.tags = unit._TagToUnit.map(({ Tag }) => Tag);
            delete unit._TagToUnit;
        }

        return json({ data: unit, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/units/fromAnnotation:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
