export default async function ({ space }, locals) {
    const { supabase, post } = locals;
    const issues = [];

    let annotations = [{}];
    for (const [branch, leaves] of space) {
        const newResults = [];
        for (const result of annotations) {
            for (const leaf of leaves) {
                const newResult = { ...result, [branch]: leaf };
                newResults.push(newResult);
            }
        }
        annotations = newResults;
    }

    for (const [i, annotation] of annotations.entries()) {
        let query = supabase.from("Unit").select("*");
        for (const [branch, leaf] of Object.entries(annotation)) {
            query = query.eq(`data->annotation->>${branch}`, leaf);
        }
        const { data: units, error } = await query;
        if (error) throw error;

        if (units.length === 0) {
            issues.push({
                message: "unit missing.",
                path: ["unit"],
                violation: "required",
                context: { annotation }
            });
        } else if (units.length === 1) {
            const unit = units[0];
            const { data: tag } = await supabase
                .from("Tag")
                .select("*")
                .eq("data->ONTOLOGICAL->>branch", "lemma")
                .eq("data->ONTOLOGICAL->>leaf", annotation.lemma)
                .single();

            if (!tag) {
                console.log("lemma tag is missing", annotation.lemma);
                // issues.push({message: "tag is missing.", path: ["tag"], violation: "required", context: { unit, annotation }});
                continue;
            }
            const { data: connection } = await supabase
                .from("_TagToUnit")
                .select("*")
                .eq("A", tag.id)
                .eq("B", unit.id)
                .single();
            if (connection) continue;

            issues.push({
                message: "unit is not connected to its lemma tag.",
                path: ["unit", "tag"],
                violation: "required",
                context: { unit, test: { required: { branch: "lemma", leaf: unit.lemma } } }
            });
        } else if (units.length >= 2) {
            // ok different strategy:
            // delete all but 1.
            // pass that one to invalid. have invalid enforce the annotation.
            units.map((unit) => {
                issues.push({
                    message: "Multiple units for the same annotation found.",
                    path: ["unit"],
                    violation: "invalid",
                    context: { unit, annotation }
                });
            });
        }
    }
    return { isValid: issues.length === 0, issues };
}
