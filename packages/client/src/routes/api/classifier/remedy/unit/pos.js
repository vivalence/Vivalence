import { annotations } from "$classifier/ontology";

async function mismatch(issue, locals) {
    const unit = issue.context.unit;
    let resolved = { resolved: false, unit: null, tag: null };

    const pos = await (async function fromLLM() {
        const { data: choice, error } = await locals.get("/api/llm", {
            prompt: (() => {
                const demoData = { ...unit.data };
                delete demoData.annotation;
                return `### Task
Identify the Part of Speech (defined by Universal Dependencies) of a spanish word.

### Input
\`\`\`json
${JSON.stringify(demoData, null, 2)}
\`\`\`

### Output
\`\`\`json
{"pos": "${annotations.pos.enum.join('" | "')}"}
`;
            })(),
            schema: {
                title: "Part of Speech (POS) Tagging",
                type: "object",
                properties: {
                    pos: annotations.pos
                }
            },
            provider: {
                api: "openai",
                model: "gpt-4o"
            }
        });
        if (error) throw error;
        const { pos } = choice;

        if (!pos || !annotations.pos.enum.includes(pos)) {
            throw new Error("[invalid LLM response]", choice, issue);
        } else {
            return pos;
        }
    })();

    unit.data.annotation = { pos, lemma: unit.data.annotation.lemma };

    // remove any existing pos annotation
    await (async function updateUnit() {
        const { error: unitDataError } = await locals.supabase
            .from("Unit")
            .update({ data: unit.data })
            .eq("id", unit.id);
        if (unitDataError) throw unitDataError;
    })();

    // remove any pos from tags
    await (async function removePosTags() {
        const tags = unit.tags.filter((tag) => tag.data.ONTOLOGICAL?.branch === "pos");
        for (const tag of tags) {
            const { error: tagRemovalError } = await locals.supabase
                .from("_TagToUnit")
                .delete()
                .eq("A", tag.id)
                .eq("B", unit.id);
            if (tagRemovalError) throw tagRemovalError;
        }
    })();

    // find & connect to new pos tag
    await (async function connectPosTag() {
        const { data: tag, error: tagError } = await locals.supabase
            .from("Tag")
            .select(`*`)
            .eq(`data->ONTOLOGICAL->>branch`, "pos")
            .eq(`data->ONTOLOGICAL->>leaf`, pos)
            .single();
        if (tagError) throw tagError;
        const result = await locals.supabase.from("_TagToUnit").upsert({ A: tag.id, B: unit.id });
        if (result.error) throw result.error;
        resolved = { resolved: !result.error, unit, tag, from: "llm" };
    })();

    return resolved;
}
export default {
    handlers: { mismatch },
    path: ["pos"]
};
