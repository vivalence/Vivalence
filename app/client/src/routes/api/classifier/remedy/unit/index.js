import * as ontology from "$classifier/ontology";

import annotation from "./annotation";
import tag from "./tag";

async function required(issue, locals) {
    let resolved = { resolved: false };
    const annotation = issue.context.annotation;

    await (async function fromLLM() {
        const { data, error } = await locals.get("/api/llm", {
            prompt: (() => {
                return `### Task: Autocomplete Spanish Language Unit
You are given an annotation provided by universal dependencies and are to return a complete unit object, that matches the annotation, complete with examples.
the unit represents a spanish language word, its english translation, and a set of usage examples, plus the annotation provided by universal dependencies.
Your task is to improve the data object, such that it is the most accurate representation of the word in question, with the most accurate annotation, and the most useful and accessible usage examples.
The annotation is provided below, and you should provide a new data object that completes the unit.

### Input
Improve this data object:
\`\`\`json
${JSON.stringify(annotation, null, 2)}
\`\`\`

### Examples
This is what high quality data looks like:
{"english": "they say", "spanish": "digan", "annotation": {"pos": "verb", "lemma": "decir", "verbform": "fin", "mood": "imp", "tense": "pres", "aspect": "imp", "number": "plur", "person": "3"}, "usageInEnglish": "They say the truth.", "usageInSpanish": "Digan la verdad."}
{"english": "doctor", "spanish": "médico", "annotation": {"pos": "noun", "lemma": "médico", "gender": "masc", "number": "sing"}, "usageInEnglish": "Speak with your doctor.", "usageInSpanish": "Hable con su médico."}
Notice how simple and straightforward english, spanish and the examples are. there is no complication, no brackets, no jargon, no technical terms. only simple, clear, and easy to understand language. strive for this simplicity and clarity.

### Output
estimate the index. lower means unit is more frequent.
`;
            })(),
            schema: {
                type: "object",
                properties: {
                    reasoning: {
                        type: "string",
                        description: `
1: Summarize the task and success criteria in 2 sentences.
2: write about the data you are given, and if it is correct or incorrect, and if it matches the criteria.
3: if its incorrect, describe what the problem is, and what the correction must be.
`
                    },
                    unit: ontology.unit.schema
                },
                required: ["reasoning", "unit"]
            },
            provider: {
                api: "openai",
                model: "gpt-4o"
            }
        });

        if (error) throw error;
        if (data.unit && data.unit.spanish && data.unit.annotation) {
            const result = await locals.supabase
                .from("Unit")
                .insert({ data: data.unit })
                .select("*")
                .single();

            resolved = { resolved: !result.error, unit: { data: result.data }, from: "llm" };
            if (result.error) resolved.error = result.error;
        }
    })();
    return resolved;
}

async function forbidden(issue, locals) {
    const unit = issue.context.unit;
    const response = await locals.supabase.from("Unit").delete().eq("id", unit.id);
    return { resolved: !response.error, unit: { id: unit.id }, error: response.error };
}

async function invalid(issue, locals) {
    let resolved = { resolved: false };
    const unit = issue.context.unit;

    await (async function fromLLM() {
        const { data, error } = await locals.get("/api/llm", {
            prompt: ((unit) => {
                return `### Task: Autocorrect Spanish Language Unit
You are given a unit of data that represents a spanish language word, its english translation, an annotation provided by universal dependencies, and a set of usage examples. 
Your task is to improve the data object, such that it is the most accurate representation of the word in question, with the most accurate annotation, and the most useful and accessible usage examples.
The data object is provided below, and you should provide a new data object that is an improvement on the original.

### Input
Improve this data object:
\`\`\`json
${JSON.stringify(unit.data, null, 2)}
\`\`\`

### Examples
This is what high quality data looks like:
{"english": "they say", "spanish": "digan", "annotation": {"pos": "verb", "lemma": "decir", "verbform": "fin", "mood": "imp", "tense": "pres", "aspect": "imp", "number": "plur", "person": "3"}, "usageInEnglish": "They say the truth.", "usageInSpanish": "Digan la verdad."}
{"english": "doctor", "spanish": "médico", "annotation": {"pos": "noun", "lemma": "médico", "gender": "masc", "number": "sing"}, "usageInEnglish": "Speak with your doctor.", "usageInSpanish": "Hable con su médico."}
Notice how simple and straightforward english, spanish and the examples are. there is no complication, no brackets, no jargon, no technical terms. only simple, clear, and easy to understand language. strive for this simplicity and clarity.

### Output
estimate the index. lower means unit is more frequent.
If the unit is already correct and cannot be improved, leave 'properties.unit' empty.

`;
            })(unit),
            schema: {
                type: "object",
                properties: {
                    reasoning: {
                        type: "string",
                        description: `
1: Summarize the task and success criteria in 2 sentences.
2: write about the data you are given, and if it is correct or incorrect, and if it matches the criteria.
3: if its incorrect, describe what the problem is, and what the correction must be.
`
                    },
                    unit: ontology.unit.schema
                },
                required: ["reasoning"]
            },
            provider: {
                api: "openai",
                model: "gpt-4o"
            }
        });

        if (error) throw error;
        if (data.unit && data.unit.spanish && data.unit.annotation) {
            const result = await locals.supabase
                .from("Unit")
                .update({
                    updatedAt: new Date().toISOString(),
                    data: data.unit
                })
                .eq("id", unit.id);
        }
        resolved = { resolved: !error, unit: { data: data.unit }, from: "llm" };
    })();
    resolved.annotation = issue.context.annotation;
    return resolved;
}

export default {
    handlers: { required, invalid, forbidden },
    path: ["unit"],
    children: [annotation, tag]
};
