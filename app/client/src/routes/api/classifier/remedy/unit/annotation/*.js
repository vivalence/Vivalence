import { annotations, pos, unit as unitPrototype } from "$classifier/ontology";

async function invalid(issue, locals) {
    const unit = issue.context.unit;

    const invalidAnnotationKey = issue.path[issue.path.length - 1];
    const invalidAnnotationValue = issue.context.error.data;

    console.log("[DELETING] annotation key:", invalidAnnotationKey);

    delete unit.data.annotation[invalidAnnotationKey];
    const result = await locals.supabase
        .from("Unit")
        .update({
            updatedAt: new Date().toISOString(),
            data: unit.data
        })
        .eq("id", unit.id);
    return { resolved: !result.error, unit, from: "hardcode" };
}

// @lj
// invalid & required might cause oscillation.
// invalid deletes the annotation key,
// required adds the annotation key from tag.
// if the tag is faulty, it will never be resolved,
// instead the handlers will keep toggling the annotation key.
// SOLUTION: either removed the tag too, or ask llm.

async function required(issue, locals) {
    const unit = issue.context.unit;
    const requiredAnnotationKey = issue.context.error.params.missingProperty;

    let resolved = { resolved: false, unit: null };

    await (async function fromTag() {
        const missingTag = unit.tags.find((tag) => {
            return tag.data.ONTOLOGICAL?.branch === requiredAnnotationKey;
        });
        if (missingTag) {
            unit.data.annotation[requiredAnnotationKey] = missingTag.data.ONTOLOGICAL.leaf;
            const result = await locals.supabase
                .from("Unit")
                .update({
                    updatedAt: new Date().toISOString(),
                    data: unit.data
                })
                .eq("id", unit.id);
            resolved = { resolved: !result.error, unit, tag: missingTag, from: "tag" };
        }
    })();
    if (resolved.resolved) return resolved;

    await (async function fromLLM() {
        const { schema } = pos[unit.data.annotation.pos];
        const property = schema.properties.annotation.properties[requiredAnnotationKey];

        const { data, error } = await locals.get("/api/llm", {
            prompt: (() => {
                return `### Task
You autocomplete the missing annotation for property key: "${requiredAnnotationKey}".

### Input
\`\`\`json
${JSON.stringify(unit.data, null, 2)}
\`\`\`

### Output
\`\`\`json
{"${requiredAnnotationKey}": ""}
`;
            })(),
            schema: {
                properties: {
                    [requiredAnnotationKey]: property
                }
            },
            provider: {
                api: "openai",
                model: "gpt-4o"
            }
        });
        if (error) throw error;
        if (!!data[requiredAnnotationKey] && property.enum.includes(data[requiredAnnotationKey])) {
            unit.data.annotation[requiredAnnotationKey] = data[requiredAnnotationKey];
            const result = await locals.supabase
                .from("Unit")
                .update({
                    updatedAt: new Date().toISOString(),
                    data: unit.data
                })
                .eq("id", unit.id);
            resolved = { resolved: !result.error, unit, from: "llm" };
        } else {
            console.log("[invalid LLM response]:", data);
            console.log(
                `if ${JSON.stringify(issue.context.error.data, null, 2)} is verb but misses verbform, then thats the ajv bug.`
            );
            console.log(`unit:`, unit.id);
            throw new Error("[invalid LLM response]");
        }
    })();
    return resolved;
}

async function forbidden(issue, locals) {
    const unit = issue.context.unit;
    const forbiddenAnnotationKey = issue.path[issue.path.length - 1];
    delete unit.data.annotation[forbiddenAnnotationKey];
    const result = await locals.supabase
        .from("Unit")
        .update({
            updatedAt: new Date().toISOString(),
            data: unit.data
        })
        .eq("id", unit.id);
    return { resolved: !result.error, unit, from: "hardcode" };
}

export default {
    handlers: { required, invalid, forbidden },
    path: ["*"]
};
