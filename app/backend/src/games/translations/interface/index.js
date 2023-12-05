// import Mustache from "mustache";

import { prisma } from "../../../prisma-client.js";
import { builder } from "../../../pothos-client/builder.js";

import evaluate from "../logic/evaluate.js";
import generateSentence from "../logic/generate.js";
// import { getNextGameUnit } from "../logic/getNextGameUnit.js";

//
//  INPUTS
//

builder.inputType("Game_Translations_GetSentence_Input", {
    fields: (t) => ({
        gameId: t.id({ required: true }),
    }),
});

builder.inputType("Game_Translations_ReviewSentence_Input", {
    fields: (t) => ({
        gameId: t.id({ required: true }),
        learning: t.string({ required: true }),
        spoken: t.string({ required: true }),
        input: t.string({ required: true }),
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
            try {
                const { gameId } = input;
                const game = await prisma.game.findUnique({
                    where: { id: gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });
                if (!game) throw new Error("Game not found");
                const sentence = await generateSentence({
                    gameId,
                    curriculumId: game.curriculumRelation.curriculumId,
                    mask: game.curriculumRelation.mask,
                });
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
    Game_Translations_ReviewSentence: t.field({
        type: "Game_Translations_ReviewSentence_Response",
        args: {
            input: t.arg({
                type: "Game_Translations_ReviewSentence_Input",
                required: true,
            }),
        },

        resolve: async (root, { input }, _) => {
            try {
                const {
                    gameId,
                    learning: learningSentence,
                    spoken: spokenSentence,
                    input: userInput,
                } = input;

                const evaluation = await evaluate({
                    learningLanguage: "spanish",
                    spokenLanguage: "english",
                    userInput,
                    sentence: { learning: learningSentence, spoken: spokenSentence },
                });
                evaluation.gameId = gameId;
                return evaluation;
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
        spoken: t.string({ resolve: ({ sentenceSpoken }) => sentenceSpoken }),
        learning: t.string({ resolve: ({ sentenceLearning }) => sentenceLearning }),
    }),
});

builder.objectType("Game_Translations_ReviewSentence_Response", {
    fields: (t) => ({
        gameId: t.id({ required: true, resolve: ({ gameId }) => gameId }),
        parts: t.field({
            type: ["Game_Translations_ReviewSentence_Part"],
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
            type: "Game_Translations_ReviewSentence_Classification_Enum",
            required: true,
            resolve: ({ classification }) => classification,
        }),
        feedback: t.string({ required: true, resolve: ({ feedback }) => feedback }),
    }),
});

builder.objectType("Game_Translations_ReviewSentence_Part", {
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
            type: "Game_Translations_ReviewSentence_Classification_Enum",
            required: true,
            resolve: ({ classification }) => classification,
        }),
    }),
});

builder.enumType("Game_Translations_ReviewSentence_Classification_Enum", {
    values: ["correct", "info", "mistake", "failure"],
});
