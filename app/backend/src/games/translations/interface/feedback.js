import prisma from "../../../prisma-client.js";
import { builder } from "../../../pothos-client/builder.js";

import maskFactory from "../../library/maskFactory.js";
// import getUnits from "../../library/gameUnits.js";

builder.mutationFields((t) => ({
    Game_Translations_Feedback: t.field({
        type: "Game_Translations_Feedback_Response",
        args: {
            input: t.arg({
                type: "Game_Translations_SentenceTranslation_Input",
                required: true,
            }),
        },
        resolve: async (root, { input }, _) => {
            try {
                const { gameId, payload, learning, spoken, translation } = input;

                const game = await prisma.game.findUnique({
                    where: { id: gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });

                if (!game) throw new Error("Game not found");

                const inputs = {
                    gameId: game.id,
                    curriculumId: game.curriculumRelation.curriculumId,
                    payload: JSON.parse(payload),
                    sentence: { learning, spoken, translation },
                };
                const primitives = {};
                const context = {
                    mask: {
                        ...game.curriculumRelation.mask.data,
                        ...game.curriculumRelation.mask.data.feedback,
                    },
                };

                const feedback = await maskFactory(inputs, primitives, context);
                feedback.gameId = gameId;
                return feedback;
            } catch (e) {
                console.log("ERROR", e);
                throw e;
            }
        },
    }),
}));

builder.objectType("Game_Translations_Feedback_Response", {
    fields: (t) => ({
        gameId: t.id({ required: true, resolve: ({ gameId }) => gameId }),
        parts: t.field({
            type: ["Game_Translations_Feedback_Part"],
            list: true,
            required: true,
            resolve: ({ parts }) => parts,
        }),
        correction: t.string({
            nullable: true,
            resolve: ({ correction }) => correction,
        }),
        score: t.float({ required: true, resolve: ({ score }) => score }),
        classification: t.field({
            type: "Game_Translations_Feedback_Classification_Enum",
            required: true,
            resolve: ({ classification }) => classification,
        }),
        summary: t.string({ required: true, resolve: ({ summary }) => summary }),
    }),
});

builder.objectType("Game_Translations_Feedback_Part", {
    fields: (t) => ({
        part: t.string({
            required: true,
            resolve: ({ part }) => part,
        }),
        correction: t.string({
            nullable: true,
            resolve: ({ correction }) => correction,
        }),
        translation: t.string({
            required: true,
            resolve: ({ translation }) => translation,
        }),
        classification: t.field({
            type: "Game_Translations_Feedback_Classification_Enum",
            required: true,
            resolve: ({ classification }) => classification,
        }),
    }),
});

builder.enumType("Game_Translations_Feedback_Classification_Enum", {
    values: ["correct", "info", "mistake", "failure"],
});
// import Mustache from "mustache";
// import { prisma } from "../../../prisma-client.js";
// import { getGPTResponse } from "../../../library/openai-client.js";
// import handleGameUpdate from "../../library/handleGameUpdate.js";
// import { log } from "../../../library/logging.js";

// export default async function feedback(input) {
//     const { gameId, payload, language, sentence, translation, mask } = input;
//     try {
//         const units = await prisma.unit.findMany({
//             where: { id: { in: payload.ids } },
//             select: { id: true, data: true },
//         });

//         const promptInputs = {
//             language,
//             sentence,
//             translation,
//             units: units.map((unit) => ({
//                 id: unit.id,
//                 learning: unit.data[language.learning],
//                 spoken: unit.data[language.spoken],
//             })),
//         };
//         const prompt = Mustache.render(mask.data.feedback.prompt, promptInputs);

//         const start = Date.now();
//         const model = "gpt-3.5-turbo-1106"; // "gpt-4-1106-preview"; // "gpt-3.5-turbo-1106"
//         const response = await getGPTResponse({
//             prompt: [prompt],
//             model,
//             schema: mask.data.feedback.schema,
//         });
//         const duration = (Date.now() - start) / 1000;
//         log("feedbackSentence", { prompt, input: promptInputs, response, duration, model });

//         return response.feedback;
//     } catch (error) {
//         console.error("Error in evaluate:", error);
//         throw error;
//     }
// }

// function makePrompt(input) {
//     return prompt;
// }
// //         console.log(
// //             `
// // "evaluation response":
// // prompt:        ${promptInputs.sentence.spoken}
// // goal:          ${promptInputs.sentence.learning}
// // user:          ${promptInputs.translation}
// // correction:    ${response.feedback.correction}

// // input units:
// // ${promptInputs.units.map((unit) => unit.word.spoken + " " + unit.word.learning).join("\n")}

// // evaluations:
// // ${response.evaluations
// //     .map(
// //         (item) =>
// //             units.find((unit) => unit.id === item.id).data[language.learning] +
// //             " " +
// //             item.evaluation,
// //     )
// //     .join("\n")}
// // `,
// //         );

// // const evaluation = await evaluate(inputTest);
// // const inputTest = {gameId: "clpr5668n0000g01pvnkghden", translation: "ser muy paciencia", language: {learning: "spanish", spoken: "english",}, payload: JSON.parse('{"spoken":"To be very patient","learning":"Ser muy paciente","ids":["clpl42ky60000g0mayurk9lny","clnt09id70010g0nukms326hd"]}',), sentence: {learning: "Ser muy paciente", spoken: "To be very patient",},}; const evaluationTest = {feedback: {parts: [{part: "ser", translation: "to be", classification: "correct",}, {part: "muy", translation: "very, really", classification: "correct",}, {part: "paciencia", correction: "paciente", translation: "patient", classification: "mistake",},], correction: "Ser muy paciente", score: 0.67, classification: "mistake", feedback: "The translation is mostly correct, but 'paciencia' should be 'paciente' to correctly match the adjective form in English.",}, evaluations: [{id: "clnt09id70010g0nukms326hd", evaluation: "correct",}, {id: "clpl42ky60000g0mayurk9lny", evaluation: "correct",},],};

// // const mask = {generate: {prompt: `You are generating language learning material for a user learning {{language.learning}}. Using the following constraints generate a sentence in {{language.spoken}} and its translation in {{language.learning}}: Tense: {{constraints.tense}}, mood: {{constraints.mood}}, performer: {{constraints.performer}}, Select from among these words: {{#units}} { id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}", tags: [ {{#tags}}{{.}}, {{/tags}}] }, {{/units}} Return the following JSON structure: {"spoken": "Sentence in {{language.spoken}}", "learning": "Sentence in {{language.learning}}", "ids": ["ID", ...], // the ids of the words used to generate the sentence. One-to-one correspondence is required.} Don't use words more advanced than those provided. We want the learner to be successfull. Keep the sentence between 4-7 words. The sentence must be semantically correct and either a reasonable or common thing to say.`,}, evaluate: {prompt: `A language learner was prompted with a {{language.spoken}} sentence and asked to provide the {{language.learning}} translation as a learning exercise. You provide feedback on the translation for the user, and you provide an technical evaluation on the successfull usage of specific individual words. Feedback: Assess each part-of-speech and the overall quality of the translation. Include a score and classification for both individual parts and the entire sentence. The learner was prompted with this sentence: <prompt>{{{sentence.spoken}}}</prompt> The learner provided this translation: <translation>{{translation}}</translation> This was the originially intended translation, but the learner never saw it: <translation>{{sentence.learning}}</translation> Evaluation: The sentence was generated from these words: {{#units}} { id: "{{id}}", {{language.spoken}}: "{{word.spoken}}", {{language.learning}}: "{{word.learning}}" }, {{/units}} Evaluate whether the usage of these words as either KNOWN or UNKNOWN. Respond in this json structure exactly: """ FeedbackEnum = "correct" // If it is correct | "info" // If it is correct but not the best way to say it | "mistake" // If it is incorrect but understandable | "failure" // If it is incorrect and not understandable EvaluationEnum = "KNOWN" | "UNKNOWN" {"feedback": {"parts": [{ // Breakdown of the sentence into parts of speech "part": String, // The part in the sentence "correction": Optional<String>, // The correction of the word, if the word was not perfectly correct "translation": String, // The translation of the part of speech "classification": FeedbackEnum, // Categorized quality of this part of speech}], "correction": Optional<String>, // The correction of the whole sentence, if the sentence was incorrect "score": Float, // Number between 0 and 1, indicating the quality of the translation. "classification": FeedbackEnum, // Categorized quality of the translation "feedback": String, // One sentence on the quality of the translation, providing valuable feedback to the learner}, "evaluations": [{id: "ID", evaluation: EvaluationEnum}]}"""`,},}; console.log(JSON.stringify(mask));
