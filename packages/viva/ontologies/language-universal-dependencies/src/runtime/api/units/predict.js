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

    // @lf custom fillter per ontology:
    annotations = annotations.filter((annotation) => {
        // filter for data security reasons. mistyping could cause earasure of corpus
        if (!annotation.pos) return false;
        else if (["verb", "noun"].includes(annotation.pos)) return !!annotation.lemma;
        // else if (["det", "pron"].includes(annotation.pos)) return true;
        // else if (["adv"].includes(annotation.pos)) return true;
        else return true;
    });
    if (annotations.length === 0) {
        issues.push({ message: "no annotations to validate.", context: { space } });
        return { isValid: false, issues };
    }

    for (const [i, annotation] of annotations.entries()) {
        let query = supabase.from("Unit").select("*");
        for (const [branch, leaf] of Object.entries(annotation)) {
            if (typeof leaf === "string") query = query.eq(`data->annotation->>${branch}`, leaf);
            else if (leaf === null || leaf === undefined || leaf === false)
                query = query.filter(`data->annotation->>${branch}`, "is", null);
            else throw new Error("invalid leaf type");
        }
        const { data: units, error } = await query.order("updatedAt", { ascending: true });
        if (error) throw error;

        if (!units || units.length === 0) {
            issues.push({
                message: "unit missing.",
                path: ["unit"],
                violation: "required",
                context: { annotation }
            });
        } else if (units.length === 1) {
            // @lf again, this only applies to the lemma branch
            if (annotation.lemma && ["verb", "aux"].includes(annotation.pos)) {
                const unit = units[0];
                const { data: tag } = await supabase
                    .from("Tag")
                    .select("*")
                    .eq("data->ONTOLOGICAL->>branch", "lemma")
                    .eq("data->ONTOLOGICAL->>leaf", annotation.lemma)
                    .single();

                // @lf custom fillter per ontology:
                if (!tag) {
                    // again, this must be customized to the ontology
                    console.log("lemma tag is missing", annotation.lemma);
                    // issues.push({message: "tag is missing.", path: ["tag"], violation: "required", context: { unit, annotation }});
                    // continue;
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
            }
        } else if (units.length >= 2) {
            const [unit] = units.splice(0, 1);
            issues.push({
                message: "Multiple units for the same annotation found. This one will be cleaned.",
                path: ["unit"],
                violation: "invalid",
                context: { unit, annotation }
            });
            units.map(async (unit) => {
                issues.push({
                    message:
                        "Multiple units for the same annotation found. This one will be deleted.",
                    path: ["unit"],
                    violation: "forbidden",
                    context: { unit, annotation }
                });
            });
        }
    }

    return { isValid: issues.length === 0, issues };
}
