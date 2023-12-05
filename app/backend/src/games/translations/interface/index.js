// import Mustache from "mustache";

import { prisma } from "../../../prisma-client.js";
import { builder } from "../../../pothos-client/builder.js";

import generateSentence from "../logic/generate.js";
// import { getNextGameUnit } from "../logic/getNextGameUnit.js";

//
//  INPUTS
//

builder.inputType("Game_Translations_GetSentence_Input", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", required: true }),
    }),
});

builder.inputType("Game_Translations_ReviewSentence_Input", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", required: true }),
        learning: t.field({ type: "String", required: true }),
        spoken: t.field({ type: "String", required: true }),
        input: t.field({ type: "String", required: true }),
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
                console.log("input", input);
                const { gameId, learning, spoken, input: userInput } = input;
                const game = await prisma.game.findUnique({ where: { id: gameId } });
                // how the fuck do i review?

                // let gameUnitRelation = await GameUnitRelation.get(input);
                // if (gameUnitRelation) {
                //     gameUnitRelation = await GameUnitRelation.update(input, gameUnitRelation);
                // } else {
                //     gameUnitRelation = await GameUnitRelation.create(input);
                // }
                // return gameUnitRelation;
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
        spoken: t.field({ type: "String", resolve: ({ sentenceSpoken }) => sentenceSpoken }),
        learning: t.field({ type: "String", resolve: ({ sentenceLearning }) => sentenceLearning }),
    }),
});

builder.objectType("Game_Translations_ReviewSentence_Response", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", resolve: ({ gameId }) => gameId }),
    }),
});

// // Enums
// builder.enumType("Game_Flashcards_ReviewResponses_Enum", {
//     values: ["KNOWN", "UNKNOWN", "GRADUATE"],
// });
