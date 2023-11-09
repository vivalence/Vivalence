import { builder } from "../../../pothos-client/builder.js";
import { prisma } from "../../../prisma-client.js";

builder.queryFields((t) => ({
    flashcardsInit: t.field({
        type: "FlashcardsGamePlayInit",
        args: {
            gamePlayStateInput: t.arg({ type: "FlashcardsGamePlayStateInput", required: true }),
        },
        resolve: async (root, args) => args,
    }),
}));

builder.objectType("FlashcardsGamePlayInit", {
    fields: (t) => ({
        gamePlayStateUpdate: t.field({
            type: "FlashcardsGamePlayStateUpdate",
            resolve: async ({ gamePlayStateInput }, _) => {
                return gamePlayStateInput;
            },
        }),
    }),
});

// return { fetch, blacklist, curriculumId: curriculumRelation.curriculumId, gameId };
