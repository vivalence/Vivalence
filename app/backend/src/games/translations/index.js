import { builder } from "../../pothos-client/builder.js";

import "./interface/generate.js";
import "./interface/evaluate.js";
import "./interface/feedback.js";
import "./seed/masks.js";

builder.inputType("Game_Translations_SentenceTranslation_Input", {
    fields: (t) => ({
        gameId: t.id({ required: true }),
        learning: t.string({ required: true }),
        spoken: t.string({ required: true }),
        translation: t.string({ required: true }),
        payload: t.string({ required: true }),
    }),
});

// //
// //  INPUTS
// //
// const dryRun = false;
// const dummy = async () => {await sleep(2000);
// const random = Math.floor(Math.random() * 100); return {evaluate: {gameId: "clpr5668n0000g01pvnkghden",}, feedback: {parts: [{part: "I", translation: "Yo", correction: "Yolo", classification: "info",}, {part: "can", translation: "puedo", classification: "correct",}, {part: "speak", translation: "hablar", classification: "correct",}, {part: "without", translation: "sin", classification: "correct",}, {part: "stopping", translation: "parar", classification: "correct",},], score: 1, correction: random + "Hombre yendo al tiempo", classification: "correct", feedback: random + "The translation is accurately rendered and maintains the meaning of the original sentence.", gameId: "clpr5668n0000g01pvnkghden",}, sentence: {spoken: random + "Man going to the time", learning: random + "Hombre yendo al tiempo", ids: ["clnt09m8j03shg0nuhkiik4eg", "clnt09ie1001ug0nu4tekfb9z"],},};
// };

// //
// // RESOLVERS
// //

// //
// // RETURN TYPES
// //
