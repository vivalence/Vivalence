import { SYSTEM_MODE } from "$env/static/private";
import Mustache from "mustache";
import { json } from "@sveltejs/kit";

const prompts = {
    language: { spoken: "english", learning: "spanish" },
    provider: { api: "anthropic", model: "claude-3-sonnet-20240229", max_tokens: 500 },
    parts: {
        schema: {
            title: "Feedback on a Part of Speech",
            type: "object",
            properties: {
                part: {
                    title: "the Part of Speech",
                    description:
                        "the referenced PoS. in the language to be learned. Taken from the expected translation! single word. only the PoS.",
                    type: "string"
                },
                translation: {
                    title: "PoS Learners Translation",
                    description:
                        "The original translation of this PoS by the learner. Taken from the learner's translation! single word. only the PoS.",
                    type: "string"
                },
                correction: {
                    title: "Correction",
                    description:
                        "if learner made a mistake, provide what the learner should have written. Taken from the expected translation! single word. only the PoS. optional.",
                    type: "string"
                },
                classification: {
                    title: "FeedbackEnum",
                    description:
                        `This enumeration assesses the learner's use of the specific part of speech (PoS) in the translation.` +
                        `'correct' signifies accurate usage of the PoS.` +
                        `'info' applies when non-standard usage still conveys the intended meaning, reflecting stylistic or creative choices.` +
                        `'mistake' denotes minor errors like punctuation, apostrophes, spelling, or typos, not affecting clarity or grammar.` +
                        `'failure' indicates false use or omission of the PoS.`,
                    enum: ["correct", "info", "mistake", "failure"],
                    type: "string"
                }
            },
            required: ["part", "translation", "classification"]
        },
        template: `### Instructions
Provide feedback on a specific Part of Speech (PoS) of a translation. the translation was created as a learning exercise. The user is familiar with {{language.spoken}} and is learning {{language.learning}}. Respond in JSON.
Ignore capitalization.
Assess the correctness of the Part of Speech. Reference only the PoS. Not the whole sentence.
Include a correction, translation, and classification.

### Task:
Prompted {{language.spoken}} sentence:
{{sentence.spoken}}

Expected {{language.learning}} translation: (this was hidden from the user)
{{sentence.learning}}

Learner provided translation:
{{sentence.translation}}

PoS you are evaluating:
PoS: {{part.token}}
{{language.spoken}}: {{part.spoken}}
{{language.learning}}: {{part.learning}}
upos: {{part.upos}}
start - end character: {{part.start}} - {{part.end}}

`
    },
    overall: {
        schema: {
            title: "Feedback on whole Translation",
            type: "object",
            properties: {
                correction: { title: "Correction", type: "string" },
                score: {
                    title: "Score",
                    minimum: 0.0,
                    maximum: 1.0,
                    type: "number"
                },
                classification: { $ref: "#/definitions/FeedbackEnum" },
                summary: {
                    title: "Summary",
                    description:
                        "Human readable feedback for the learner in the form of a few short and concise sentences. Meant to be displayed to the learner, such that they can improve their translation.",
                    type: "string"
                }
            },
            required: ["correction", "score", "classification", "summary"],
            definitions: {
                FeedbackEnum: {
                    title: "FeedbackEnum",
                    description: "an enumeration of this sentences' correctness.",
                    enum: ["correct", "info", "mistake", "failure"],
                    type: "string"
                }
            }
        },
        template: `### Instructions
You provide feedback on a translation, which was created as a learning exercise. Assess the overall quality of the translation. Include a score and classification. The user is familiar with {{language.spoken}} and is learning {{language.learning}}. Respond in JSON.

### Example
input
learning: Él hace comida deliciosa todos los días
spoken: He makes delicious food every day
translation: el hace delicioso cada día

response
correction: "Él hace comida deliciosa todos los días"
score: 0.4
classification: "failure"
summary: "You missed the noun 'food' ('comida') and used 'delicioso' instead of 'deliciosa', which should agree in gender with 'comida'. Additionally, 'todos los días' is a more common translation for 'every day' then 'cada día'."

### Task:
Prompted {{language.spoken}} sentence:
{{sentence.spoken}}

Expected {{language.learning}} translation: (this was hidden from the user)
{{sentence.learning}}

Learner provided translation:
{{sentence.translation}}

Feedback the translation:`
    }
};

export async function POST({ fetch, locals, request }) {
    console.log("POST /api/games/translations/feedback ");
    try {
        const { user } = await locals.getSession();
        const { sentence } = await request.json();
        const { language, overall, provider } = prompts;

        if (SYSTEM_MODE && +SYSTEM_MODE < 1) {
            console.log("STUPPING POST /api/games/translations/feedback");
            return json({
                data: {
                    correction: "El padre va a la ciudad nueva.",
                    score: 0.6,
                    classification: "mistake",
                    summary: "The verb 'va' is correct, but 'ves' is incorrect. "
                },
                status: 200
            });
        }

        const message = Mustache.render(overall.template, { language, sentence });

        const input = {
            prompt: message,
            schema: overall.schema,
            provider
        };
        const { data, error } = await locals.get("/api/llm", input);
        if (error) throw error;

        return json({ data, status: 200 });
    } catch (error) {
        console.error("[FEEDBACK ERROR] /api/games/translation/feedback", error.message);
        console.error(error);
        return json({ error, status: 500 });
    }
}

// const run = async function (inputs, primitives, context) {
//     const { gameId, curriculumId, payload, sentence } = inputs;
//     const { createLLMClient } = primitives;
//     const { language, provider, prompts } = context.mask;

//     const overall = await createLLMClient({
//         provider,
//         prompt: prompts.overall
//     });

//     const parts = await createLLMClient({ provider, prompt: prompts.parts });

//     const promises = payload.pos
//         .filter((pos) => pos.unit)
//         .map(async (pos, i) => {
//             const part = await parts({
//                 language,
//                 sentence,
//                 part: {
//                     token: pos.token,
//                     spoken: pos.unit.data[language.spoken],
//                     learning: pos.unit.data[language.learning],
//                     feats: pos.feats.STRING.replace(/\=/g, ":"),
//                     upos: pos["upos"],
//                     start: pos["start_char"],
//                     end: pos["end_char"]
//                 }
//             });
//             part.part = pos.word;
//             return part;
//         });
//     const response = await overall({ language, sentence });
//     response.parts = await Promise.all(promises);
//     return response;
// };
