import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
    try {
        const userId = (await locals.getSession()).user.id;
        const { annotation } = await request.json();
        if (["space", "sym", "x"].includes(annotation.pos)) {
            return json({ data: null, status: 200 });
        }

        let query = locals.supabase
            .from("Unit")
            .select(`*, _TagToUnit(*, Tag: A (*))`)
            .eq("data->annotation->>lemma", annotation.lemma)
            .eq("data->annotation->>pos", annotation.pos);
        // .eq("objectStatus", "ACTIVE");

        const filterTags = Object.keys(annotation)
            .filter((key) => !["pos", "lemma"].includes(key))
            .filter((key) => annotation[key])
            .map((key) => annotation[key]);

        query = query
            .in("_TagToUnit.Tag.data->ONTOLOGICAL->>leaf", filterTags)
            .not("_TagToUnit.Tag", "is", null);

        const { data, error } = await query;
        if (error) throw error;

        const units = data.filter((u) => u._TagToUnit.length === filterTags.length);
        console.log("units from annotation", units);
        console.log("SHOULD NEVER BE OTHER THAN 1", units.length);

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
