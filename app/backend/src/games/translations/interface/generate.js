import { builder } from "../../../pothos-client/builder.js";
import { prisma } from "../../../prisma-client.js";

import maskFactory from "../../library/maskFactory.js";
import getUnits from "../../library/gameUnits.js";

import cache from "../cache.js";

builder.inputType("Game_Translations_GetSentence_Input", {
    fields: (t) => ({
        gameId: t.id({ required: true }),
    }),
});

builder.queryFields((t) => ({
    Game_Translations_GetSentence: t.field({
        type: "Game_Translations_Sentence",
        args: {
            input: t.arg({
                type: "Game_Translations_GetSentence_Input",
                required: true,
            }),
        },
        resolve: async (root, { input }, _) => {
            // const cachedSentence = cache.get(); if (cachedSentence) cachedSentence;
            try {
                const game = await prisma.game.findUnique({
                    where: { id: input.gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });
                if (!game) throw new Error("Game not found");

                const mask = {
                    ...game.curriculumRelation.mask.data,
                    ...game.curriculumRelation.mask.data.generate,
                };
                const inputs = {
                    curriculumId: game.curriculumRelation.curriculumId,
                    gameId: game.id,
                };
                const sentence = await maskFactory(inputs, { getUnits }, { mask });

                if (!sentence) throw new Error("Sentence generation failed");
                // cache.set(sentence);
                return sentence;
            } catch (e) {
                console.log("ERROR", e);
                throw e;
            }
        },
    }),
}));

builder.objectType("Game_Translations_Sentence", {
    fields: (t) => ({
        spoken: t.string({ resolve: ({ spoken }) => spoken }),
        learning: t.string({ resolve: ({ learning }) => learning }),
        payload: t.string({ resolve: (sentence) => JSON.stringify(sentence) }),
    }),
});
// export default async function generate({ gameId, curriculumId, mask }) {
//     const start = Date.now();
//     const generator = new Function(`return ${mask.data.generate.generateSentence}`)();
//     let sentence = await generator({
//         mask: mask.data,
//         mustache: Mustache.render,
//         getUnits,
//         llm: (prompt) =>
//             getGPTResponse({
//                 prompt: [prompt],
//                 model: mask.data.generate.model,
//                 schema: mask.data.generate.schema,
//             }),
//     });
//     sentence = verifySentence(sentence);

//     log("generateSentence", {
//         response: sentence,
//         duration: (Date.now() - start) / 1000,
//         gameId,
//         curriculumId,
//         maskId: mask.id,
//     });
//     return sentence;
// }

// await generate({ curriculumId: "clpl75uu00000g0mwkivlcucv", gameId: "clpr5668n0000g01pvnkghden" });
// async function generated({ gameId, curriculumId, mask }) {const getterInput = {curriculumId, gameId, take: 2,}; const conjugation = (await getUnits({...getterInput, tags: ["VERB_CONJUGATION"], take: 1,})).shift(); if (!conjugation) throw new Error("No conjugation to practice now"); let units = (await Promise.all([[conjugation], getUnits({ ...getterInput, tags: ["NOUN"] }), getUnits({ ...getterInput, tags: ["VERB"] }), getUnits({ ...getterInput, tags: ["ADJECTIVE"] }), getUnits({ ...getterInput, tags: ["PRONOUN"] }), getUnits({ ...getterInput, tags: ["ADPOSITION"] }), getUnits({ ...getterInput, tags: ["ADVERB"] }), getUnits({ ...getterInput, tags: ["NUMERAL"] }), getUnits({...getterInput, tags: ["CONJUNCTION_COORDINATING", "CONJUNCTION_SUBORDINATING"],}),])).flat(); if (units.filter((item) => !!item).length < 5) throw new Error("Not enough items to practice"); const learning = "spanish"; const spoken = "english"; units = units.map((input) => ({id: input.id, learning: input.data[learning], spoken: input.data[spoken], tags: input.tags.map(({ name }) => name),})); const constraints = {tense: conjugation.data.tense, mood: conjugation.data.mood, performer: conjugation.data.performer,}; const sentence = await generateSentence({units, language: { learning, spoken }, constraints, mask,}); return sentence;}
// async function generateSentence(inputs) {try {const prompt = Mustache.render(inputs.mask.data.generate.prompt, inputs); const model = "gpt-4-1106-preview"; const start = Date.now(); const sentence = await getGPTResponse({prompt: [prompt], model, schema: inputs.mask.data.generate.schema,}); const duration = (Date.now() - start) / 1000; log("generateSentence", { prompt, input: inputs, response: sentence, duration, model }); return { spoken: sentence.spoken, learning: sentence.learning, ids: sentence.ids };} catch (error) {console.error("Error in generateSentences:", error); throw error;}}
