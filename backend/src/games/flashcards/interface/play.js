import { builder } from "../../../pothos-client/builder.js";

builder.mutationFields((t) => ({
    flashcardsLoop: t.field({
        type: "FlashcardsGamePlayLoop",
        description: ``,
        args: {
            gameUnitRelationInput: t.arg({
                type: "FlashcardsGameUnitRelationInput",
                required: true,
            }),
            gamePlayStateInput: t.arg({ type: "FlashcardsGamePlayStateInput", required: true }),
        },
        resolve: async (root, args) => args,
    }),
}));

builder.objectType("FlashcardsGamePlayLoop", {
    fields: (t) => ({
        gameUnitRelationUpdate: t.field({
            type: "FlashcardsGameUnitRelationUpdate",
            resolve: async ({ gameUnitRelationInput }, _) => {
                return gameUnitRelationInput;
            },
        }),
        gamePlayStateUpdate: t.field({
            type: "FlashcardsGamePlayStateUpdate",
            resolve: async ({ gamePlayStateInput }, _) => {
                return gamePlayStateInput;
            },
        }),
    }),
});
