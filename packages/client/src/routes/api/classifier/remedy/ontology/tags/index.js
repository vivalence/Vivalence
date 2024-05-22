async function required({ context, ...issue }, locals) {
    const feat = context[context.ontology.branch];
    const enumVal = feat.meta.enums[context.ontology.leaf];

    const tag = {
        name: `${feat.title}: ${enumVal.title}`,
        type: ["ONTOLOGICAL"],
        data: { ONTOLOGICAL: context.ontology }
    };

    const result = await locals.supabase.from("Tag").insert(tag);
    return { resolved: !!result.error, tag, error: result.error };
}

export default {
    handlers: { required },
    path: ["tags"],
    children: []
};
