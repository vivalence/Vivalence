import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";
import Mustache from "mustache";

import { sleep, wrapTextWithTag } from "$lib";

const { SYSTEM_MODE } = env;

const Prompt = {
    language: { spoken: "english", learning: "spanish" },
    // provider: { api: "openai", model: "gpt-3.5-turbo" },
    // provider: { api: "anthropic", model: "claude-3-sonnet-20240229" },
    provider: {
        api: "anthropic",
        model: "claude-3-haiku-20240307",
        max_tokens: 256,
        temperature: 0.3
    },
    // provider: { api: "anyscale", model: "mistralai/Mixtral-8x7B-Instruct-v0.1" },
    // provider: { api: "groq", model: "mixtral-8x7b-32768", temperature: 0.2 },
    schema: {
        title: "Evaluations",
        type: "object",
        definitions: {
            evaluation: {
                type: "object",
                properties: {
                    confidence: {
                        title: "Confidence level",
                        description: "How confident are you that the user knows the PART?",
                        type: "number",
                        minimum: 0.0,
                        maximum: 1.0
                    },
                    status: {
                        title: "Evaluation status",
                        description: `KNOWN indicates correct usage of PART in the translation. UNKNOWN marks incorrect usage, including spelling and missing words. NEUTRAL applies for successful alternative use. Absence of PART is UNKNOWN.`,
                        enum: ["KNOWN", "UNKNOWN", "NEUTRAL"],
                        type: "string"
                    }
                },
                required: ["confidence", "status"]
            }
        },
        properties: {}
    },

    template: `Evaluate a <PART> of translated sentence.
We ignore capitalization.
We do not ignore severe spelling errors.
If the learner used an equivalent alternative, then select NEUTRAL.
If the <PART> is missing, then select UNKNOWN.

### TRANSLATION
PROMPT: "{{{sentence.spoken}}}"
EXPECTED: "{{{sentence.learning}}}" (the tag <PART> was added now for your emphasis)
USER: "{{{sentence.translation}}}"

The <PART> you evaluate now is made up of the word (Unit) "{{part.token}}"
and the UniversalDependencys (Tags) of{{#part.tags}} {{branch}}{{/part.tags}}.

### Unit:{{part.id}}
{{{language.spoken}}}: "{{{part.spoken}}}"
{{{language.learning}}}: "{{{part.token}}}"

{{#part.tags}}
### Tag:{{id}}: {{branch}} "{{leaf}}"
Was {{branch}} "{{leaf}}" used correctly?

{{/part.tags}}

Return a JSON object with the evaluation of <PART>.
`
};

export async function POST({ fetch, locals, request }) {
    try {
        const { user } = await locals.getSession();
        const { gameId, payload, sentence } = await request.json();
        const { language } = Prompt;

        // console.log("/games/translations/evaluate", gameId, sentence);

        const learning = sentence.learning;
        const tokens = payload.tokens.filter((token) => token.unit);

        const promises = [];
        for (const [i, token] of tokens.entries()) {
            promises.push(
                (async (token, i) => {
                    const learningTagged = wrapTextWithTag(
                        learning,
                        token.start_char,
                        token.end_char,
                        "PART"
                    );

                    const part = {
                        id: token.unit.id,
                        spoken: token.unit.data[language.spoken],
                        learning: token.unit.data[language.learning],
                        token: token.token,
                        tags: token.unit.Tags.filter((tag) => tag.type.includes("LEARNABLE")).map(
                            (tag) => ({
                                id: tag.id,
                                branch: tag.data.ONTOLOGICAL.branch,
                                leaf: tag.data.ONTOLOGICAL.leaf
                            })
                        )
                    };

                    const prompt = Mustache.render(Prompt.template, {
                        part,
                        language,
                        sentence: { ...sentence, learning: learningTagged }
                    });

                    const schema = {
                        ...Prompt.schema,
                        properties: part.tags.reduce(
                            (acc, tag) => {
                                acc["Tag:" + tag.id] = { $ref: "#/definitions/evaluation" };
                                return acc;
                            },
                            { ["Unit:" + part.id]: { $ref: "#/definitions/evaluation" } }
                        )
                    };
                    schema.properties.required = Object.keys(schema.properties);

                    const input = { prompt, schema, provider: Prompt.provider };

                    const { data, error } = await locals.get("/api/llm", input);

                    if (error) return { error };
                    for (const key in data) {
                        const [type, id] = key.split(":");
                        const evaluation = data[key];
                        if (evaluation.status === "NEUTRAL") continue;
                        let response;
                        if (type === "Unit") {
                            response = await locals.post("/api/units", {
                                gameId,
                                gameType: "TRANSLATIONS",
                                unitId: id,
                                response: evaluation.status
                            });
                        } else if (type === "Tag") {
                            response = await locals.post("/api/tags", {
                                gameId,
                                gameType: "TRANSLATIONS",
                                unitId: token.unit.id,
                                tagId: id,
                                response: evaluation.status
                            });
                        }
                        return { data };
                    }
                })(token, i)
            );
        }
        const results = await Promise.all(promises);
        return json({
            data: results.map((r) => r.data),
            error: results.find((r) => r.error),
            errors: results.map((r) => r.error)
        });
    } catch (error) {
        console.error("[EVALUATION ERROR] /api/games/translation/evaluate", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}

// const run = async (inputs, primitives, context) => {
//     const { gameId, curriculumId, payload, sentence } = inputs;
//     const { prisma, nlp, createLLMClient, handleGameUpdate } = primitives;
//     const { language, provider, prompt } = context.mask;

//     const llm = await createLLMClient({ provider, prompt });

//     const PoS = payload.pos.filter((pos) => pos.unit);
//     console.log(`[expected] ${sentence.learning} [translation] ${sentence.translation}`);

//     const promises = PoS.map(async (pos, i) => {
//         const part = {
//             spoken: pos.unit.data[language.spoken],
//             learning: pos.unit.data[language.learning],
//             token: pos.token,
//             upos: pos.upos,
//             feats: pos.feats.STRING.replace(/\=/g, ":")
//         };
//         const response = await llm({ language, sentence, part });
//         // console.log(response.evaluation, part.spoken, part.learning);
//         if (response.evaluation !== "NEUTRAL")
//             await handleGameUpdate({
//                 gameId,
//                 unitId: pos.unit.id,
//                 response: response.evaluation,
//                 gameType: "TRANSLATIONS"
//             });
//     });

//     return await Promise.all(promises);
// };
