import { annotations, pos } from "$classifier/ontology";

async function invalid(issue, locals) {
    const unit = issue.context.unit;

    const invalidAnnotationKey = issue.path[issue.path.length - 1];
    const invalidAnnotationValue = issue.context.error.data;

    if (invalidAnnotationKey === "aspect" && invalidAnnotationValue === "impf") {
        unit.data.annotation.aspect = "imp";
        const result = await locals.supabase
            .from("Unit")
            .update({ data: unit.data })
            .eq("id", unit.id);
        return { resolved: !result.error, unit, from: "hardcode" };
    }

    throw new Error("invalid fix", issue);
}

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
                .update({ data: unit.data })
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
                .update({ data: unit.data })
                .eq("id", unit.id);
            resolved = { resolved: !result.error, unit, from: "llm" };
        } else {
            throw new Error("[invalid LLM response]", data, issue);
        }
    })();
    return resolved;
}

async function forbidden(issue, locals) {
    const unit = issue.context.unit;
    const forbiddenAnnotationKey = issue.path[issue.path.length - 1];
    delete unit.data.annotation[forbiddenAnnotationKey];
    const result = await locals.supabase.from("Unit").update({ data: unit.data }).eq("id", unit.id);
    return { resolved: !result.error, unit, from: "hardcode" };
}

export default {
    handlers: { required, invalid, forbidden },
    path: ["*"]
};
