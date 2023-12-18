import { prisma } from "../../prisma-client.js";
import { builder } from "../../pothos-client/builder.js";
import { log } from "../../library/logging.js";
import { sleep } from "../../utils/index.js";

import feedback from "./logic/feedback.js";
import evaluate from "./logic/evaluate.js";
import generate from "./logic/generate.js";

let cachedSentence = null;

//
//  INPUTS
//
const dryRun = false;
const dummy = async () => {
    await sleep(2000);
    const random = Math.floor(Math.random() * 100);
    return {
        review: {
            gameId: "clpr5668n0000g01pvnkghden",
        },
        feedback: {
            parts: [
                {
                    part: "I",
                    translation: "Yo",
                    correction: "Yolo",
                    classification: "info",
                },
                {
                    part: "can",
                    translation: "puedo",
                    classification: "correct",
                },
                {
                    part: "speak",
                    translation: "hablar",
                    classification: "correct",
                },
                {
                    part: "without",
                    translation: "sin",
                    classification: "correct",
                },
                {
                    part: "stopping",
                    translation: "parar",
                    classification: "correct",
                },
            ],
            score: 1,
            correction: random + "Hombre yendo al tiempo",
            classification: "correct",
            feedback:
                random +
                "The translation is accurately rendered and maintains the meaning of the original sentence.",
            gameId: "clpr5668n0000g01pvnkghden",
        },
        sentence: {
            spoken: random + "Man going to the time",
            learning: random + "Hombre yendo al tiempo",
            ids: ["clnt09m8j03shg0nuhkiik4eg", "clnt09ie1001ug0nu4tekfb9z"],
        },
    };
};

builder.inputType("Game_Translations_GetSentence_Input", {
    fields: (t) => ({
        gameId: t.id({ required: true }),
    }),
});

builder.inputType("Game_Translations_SentenceTranslation_Input", {
    fields: (t) => ({
        gameId: t.id({ required: true }),
        learning: t.string({ required: true }),
        spoken: t.string({ required: true }),
        translation: t.string({ required: true }),
        payload: t.string({ required: true }),
    }),
});

//
// RESOLVERS
//

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
            if (cachedSentence) {
                console.log("cachedSentence", cachedSentence);
                return cachedSentence;
            }
            if (dryRun) return (await dummy()).sentence;
            log("Game_Flashcards_GetSentence_Input", input);
            try {
                const { gameId } = input;
                const game = await prisma.game.findUnique({
                    where: { id: gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });
                if (!game) throw new Error("Game not found");
                const sentence = await generate({
                    gameId,
                    curriculumId: game.curriculumRelation.curriculumId,
                    mask: game.curriculumRelation.mask,
                });

                cachedSentence = sentence;
                log("Game_Flashcards_GetSentence_Response", { gameId, sentence }, "api");
                if (!sentence) throw new Error("Sentence generation failed");
                return sentence;
            } catch (e) {
                console.log("ERROR", e);
                throw e;
            }
        },
    }),
}));

builder.mutationFields((t) => ({
    Game_Translations_Review: t.field({
        type: "Game_Translations_Review_Response",
        args: {
            input: t.arg({
                type: "Game_Translations_SentenceTranslation_Input",
                required: true,
            }),
        },
        resolve: async (root, { input }, _) => {
            cachedSentence = null;
            if (dryRun) return (await dummy()).review;
            log("Game_Flashcards_Review_Input", input);
            const { gameId, payload, learning, spoken, translation } = input;

            try {
                const game = await prisma.game.findUnique({
                    where: { id: gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });

                if (!game) throw new Error("Game not found");

                const evaluation = await evaluate({
                    gameId,
                    language: {
                        learning: "spanish",
                        spoken: "english",
                    },
                    translation,
                    payload: JSON.parse(payload),
                    sentence: { learning, spoken },
                    mask: game.curriculumRelation.mask,
                });

                evaluation["gameId"] = game.id;
                log("Game_Flashcards_Review_Response", evaluation);
                return evaluation;
            } catch (e) {
                console.log("ERROR", e);
                throw e;
            }
        },
    }),
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
                if (dryRun) return (await dummy()).feedback;
                log("Game_Flashcards_Feedback_Input", input);
                const { gameId, payload, learning, spoken, translation } = input;

                const game = await prisma.game.findUnique({
                    where: { id: gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });

                if (!game) throw new Error("Game not found");

                const result = await feedback({
                    gameId,
                    language: {
                        learning: "spanish",
                        spoken: "english",
                    },
                    translation,
                    payload: JSON.parse(payload),
                    sentence: { learning, spoken },
                    mask: game.curriculumRelation.mask,
                });

                result.gameId = gameId;
                log("Game_Flashcards_Feedback_Response", result);
                return result;
            } catch (e) {
                console.log("ERROR", e);
                throw e;
            }
        },
    }),
}));

//
// RETURN TYPES
//

builder.objectType("Game_Translations_Sentence", {
    fields: (t) => ({
        spoken: t.string({ resolve: ({ spoken }) => spoken }),
        learning: t.string({ resolve: ({ learning }) => learning }),
        payload: t.string({ resolve: (sentence) => JSON.stringify(sentence) }),
    }),
});

builder.objectType("Game_Translations_Review_Response", {
    fields: (t) => ({
        gameId: t.id({ required: true, resolve: ({ gameId }) => gameId }),
    }),
});

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
        feedback: t.string({ required: true, resolve: ({ feedback }) => feedback }),
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
