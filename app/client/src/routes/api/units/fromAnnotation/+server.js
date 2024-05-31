import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
    try {
        const userId = (await locals.getSession()).user.id;
        const { annotation } = await request.json();
        if (["space", "sym", "x"].includes(annotation.pos)) {
            return json({ data: null, status: 200 });
        }

        let units = await byUnitData({ annotation }, locals);
        if (!units || units.length === 0) {
            // console.log("FIND UNITS BY TAGS");
            units = await byTags({ annotation }, locals);
        }
        if (units.length > 1) {
            const token = annotation.meta.token;
            const unit = units.find((u) => u.data.spanish.toLowerCase() === token.toLowerCase());
            if (unit) {
                // console.log("FOUND UNIT BY TOKEN");
                units = [unit];
            }
        }

        return json({ data: units, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/units/fromAnnotation:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}

async function byTags({ annotation }, { supabase }) {
    let query = supabase
        .from("Unit")
        .select(`*, _TagToUnit(*, Tag: A (*))`)
        .eq("data->annotation->>lemma", annotation.lemma)
        .eq("data->annotation->>pos", annotation.pos);
    // .eq("objectStatus", "ACTIVE");

    const filterTags = Object.keys(annotation)
        .filter((key) => !["lemma", "meta"].includes(key))
        .filter((key) => annotation[key])
        .map((key) => annotation[key]);

    query = query
        .in("_TagToUnit.Tag.data->ONTOLOGICAL->>leaf", filterTags)
        .not("_TagToUnit.Tag", "is", null);

    const { data, error } = await query;
    if (error) {
        console.log("byTags query error", error);
        throw error;
    }

    const units = data
        .filter((u) => u._TagToUnit.length === filterTags.length)
        .forEach((unit) => {
            unit.tags = unit._TagToUnit.map(({ Tag }) => Tag);
            delete unit._TagToUnit;
        });

    return units;
}
async function byUnitData({ annotation }, { supabase }) {
    let query = supabase
        .from("Unit")
        .select(`*, _TagToUnit(*, Tag: A (*))`)
        .eq("data->annotation->>lemma", annotation.lemma)
        .eq("data->annotation->>pos", annotation.pos);

    Object.keys(annotation)
        .filter((key) => !["lemma", "meta"].includes(key) && annotation[key])
        .forEach((key) => {
            query = query.eq(`data->annotation->>${key}`, annotation[key]);
        });

    const { data, error } = await query;
    if (error) {
        console.log("byUnitData query error", error);
        throw error;
    }

    const units = data
        .map((unit) => {
            unit.tags = unit._TagToUnit
                .map(({ Tag }) => Tag)
                .filter((tag) => tag.type.includes("ONTOLOGICAL") && tag.data.ONTOLOGICAL?.branch)
                .filter(
                    (tag) =>
                        annotation[tag.data.ONTOLOGICAL.branch] &&
                        annotation[tag.data.ONTOLOGICAL.branch] === tag.data.ONTOLOGICAL.leaf
                );

            delete unit._TagToUnit;
            return unit;
        })
        .sort((a, b) => b.tags.length - a.tags.length);

    return units;
}
