// const prompt = {
//     schema: {
//         title: "Evaluations",
//         type: "object",
//         properties: {
//             evaluation: {
//                 title: "Evaluation",
//                 description: `KNOWN means the learner successfully used this part of speech in their translation as expected. UNKNOWN means the learner failed in their use the expected part of speech. Spelling, missing words, and other errors are considered UNKNOWN. NEUTRAL is to be used only if the learner applied an equivalent alternative successfully. If the PoS is not present in the translation, then it is UNKNOWN.`,
//                 enum: ["KNOWN", "UNKNOWN", "NEUTRAL"],
//                 type: "string"
//             }
//         },
//         required: ["evaluation"]
//     },
//     template: `Evaluate this part of speech of a translated sentence.
// The sentence was translated from {{language.spoken}} to {{language.learning}} by a language learner as a learning exercise.

// Prompted {{language.spoken}} sentence:
// {{sentence.spoken}}

// Expected {{language.learning}} translation: (this was hidden from the learner)
// {{sentence.learning}}

// Learner provided translation:
// {{sentence.translation}}

// You provide an evaluation on the successful usage of this part of speech as KNOWN or UNKNOWN.
// The Part of Speech you are evaluating is:
// PoS: {{part.token}}
// {{language.spoken}}: {{part.spoken}}
// {{language.learning}}: {{part.learning}}
// upos: {{part.upos}}
// feats: {{part.feats}}

// Did the learner correctly use this part of speech? evaluate only the part of speech. not the whole sentence.
// `
// };
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
