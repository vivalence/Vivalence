async function required(issue, locals) {
    const unit = issue.context.unit;
    let resolved = { resolved: false, tag: null, unit: null };

    await (async function fromAnnotation() {
        const required = issue.context.test.required;
        const annotation = unit.data.annotation;
        const ontology = {
            branch: required.branch || null,
            leaf: required.leaf || annotation[required.branch] || null
        };

        let query = locals.supabase.from("Tag").select("*");
        if (ontology.branch) query = query.eq("data->ONTOLOGICAL->>branch", ontology.branch);
        if (ontology.leaf) query = query.eq("data->ONTOLOGICAL->>leaf", ontology.leaf);
        const { data: requiredTag } = await query.single();

        if (requiredTag) {
            const result = await locals.supabase
                .from("_TagToUnit")
                .upsert({ A: requiredTag.id, B: unit.id });
            resolved = { resolved: !result.error, tag: requiredTag, unit, from: "annotation" };
        } else {
            console.log("required tag not found", ontology, unit.id, unit.data.annotation);
            // console.log(JSON.stringify(issue, null, 2));
            resolved = { resolved: false, issue, error: { message: "required tag not found" } };
        }
    })();

    return resolved;
}

async function unique(issue, locals) {
    const constraint = issue.context.test.unique;
    const unit = issue.context.unit;
    let resolved = [];

    await (async function fromAnnotation() {
        const annotation = unit.data.annotation;

        const tags = unit.tags
            .filter((tag) => {
                // get all tags that match the constraint
                return (
                    (constraint.branch
                        ? tag.data.ONTOLOGICAL?.branch === constraint.branch
                        : true) &&
                    (constraint.leaf ? tag.data.ONTOLOGICAL?.leaf === constraint.leaf : true)
                );
            })
            .filter((tag) => {
                // filter out tags that are covered in the annotation
                return !Object.keys(annotation).some((key) => {
                    return (
                        key === tag.data.ONTOLOGICAL.branch &&
                        annotation[key] === tag.data.ONTOLOGICAL.leaf
                    );
                });
            });

        // delete all tags that match the constraint but are not in the annotation
        for (const tag of tags) {
            const result = await locals.supabase
                .from("_TagToUnit")
                .delete()
                .eq("A", tag.id)
                .eq("B", unit.id);

            resolved.push({ resolved: !result.error, tag, unit });
        }
    })();

    return resolved[0];
}

async function forbidden(issue, locals) {
    const unit = issue.context.unit;
    const forbidden = issue.context.test.forbidden;
    const annotation = unit.data.annotation;

    const tag = unit.tags.find((tag) => {
        return (
            (forbidden.branch ? tag.data.ONTOLOGICAL?.branch === forbidden.branch : true) &&
            (forbidden.leaf ? tag.data.ONTOLOGICAL?.leaf === forbidden.leaf : true)
        );
    });

    const result = await locals.supabase
        .from("_TagToUnit")
        .delete()
        .eq("A", tag.id)
        .eq("B", unit.id);

    return { resolved: !result.error, tag, unit };
}

export default {
    handlers: { forbidden, required, unique },
    path: ["tag"],
    children: []
};
