import { SYSTEM_MODE } from "$env/static/private";
import { json } from "@sveltejs/kit";
import Mustache from "mustache";

import { sleep, wrapTextWithTag } from "$lib";

const prompt = {
    language: { spoken: "english", learning: "spanish" },
    provider: { api: "anthropic", model: "claude-3-sonnet-20240229" },
    schema: {
        title: "Evaluations",
        type: "object",
        properties: {
            evaluation: {
                title: "Evaluation",
                description: `KNOWN means the learner successfully used this part of speech in their translation as expected. UNKNOWN means the learner failed in their use the expected part of speech. Spelling, missing words, and other errors are considered UNKNOWN. NEUTRAL is to be used only if the learner applied an equivalent alternative successfully. If the PoS is not present in the translation, then it is UNKNOWN.`,
                enum: ["KNOWN", "UNKNOWN", "NEUTRAL"],
                type: "string"
            }
        },
        required: ["evaluation"]
    },
    template: `Evaluate a <PART> of a translated sentence.

The <PART> you evaluate now is:
{{{language.spoken}}}: "{{{part.spoken}}}" - prompted
{{{language.learning}}}: "{{{part.token}}}" - expected

Context:
upos: {{{part.upos}}}
feats: {{{part.feats}}}

We ignore capitalization and punctuation.
We do not ignore severe spelling errors.
If the learner used an equivalent alternative, then select NEUTRAL.
If the <PART> is missing, then select UNKNOWN.
Did the learner correctly translate "{{{part.token}}}", used it in the right place, and used it correctly?

As evidenced by the translation provided by the learner:
"{{{sentence.translation}}}"

of this sentence:
"{{{sentence.spoken}}}"

when it should have been this:
"{{{sentence.learning}}}" (the tag <PART> was added now for your emphasis)
`
};

export async function POST({ fetch, locals, request }) {
    console.log("POST /api/games/translations/evaluate ");
    try {
        const { user } = await locals.getSession();
        const { gameId, payload, sentence } = await request.json();
        const { language } = prompt;

        const learning = sentence.learning;
        const tokens = payload.tokens.filter((token) => token.unit);

        const promises = tokens.map(async (token, i) => {
            const learningTagged = wrapTextWithTag(
                learning,
                token.start_char,
                token.end_char,
                "PART"
            );

            const part = {
                spoken: token.unit.data[language.spoken],
                learning: token.unit.data[language.learning],
                token: token.token,
                upos: token.upos,
                feats: token.feats.STRING.replace(/\=/g, ":")
            };

            const inputPrompt = {
                part,
                language,
                sentence: {
                    ...sentence,
                    learning: learningTagged
                }
            };
            const message = Mustache.render(prompt.template, inputPrompt);

            (await sleep(i * 1.1)) && console.log("SLEEPT /translation/evaluate");

            const input = {
                prompt: message,
                schema: prompt.schema,
                provider: prompt.provider
            };

            const { data, error } = await locals.get("/api/llm", input);

            if (error) console.error(error);
            else if (data.evaluation !== "NEUTRAL") {
                return await locals.post("/api/units", {
                    gameId,
                    gameType: "TRANSLATIONS",
                    unitId: token.unit.id,
                    response: data.evaluation
                });
            }
        });
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
