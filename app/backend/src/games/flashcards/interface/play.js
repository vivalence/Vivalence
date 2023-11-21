import { builder } from "../../../pothos-client/builder.js";

builder.mutationFields((t) => ({
    flashcardsPlay: t.field({
        type: "FlashcardsPlay",
        args: {
            gameStateInput: t.arg({ type: "FlashcardsGameStateInput", required: true }),
            gameUnitRelationInput: t.arg({
                type: "FlashcardsGameUnitRelationInput",
                required: true,
            }),
        },
        resolve: async (root, args) => args,
    }),
}));

// RETURN TYPE
builder.objectType("FlashcardsPlay", {
    fields: (t) => ({
        gameStateUpdate: t.field({
            type: "FlashcardsGameStateUpdate",
            resolve: async ({ gameStateInput }, _) => {
                return gameStateInput;
            },
        }),
        gameUnitRelationUpdate: t.field({
            type: "FlashcardsGameUnitRelationUpdate",
            resolve: async ({ gameUnitRelationInput }, _) => {
                return gameUnitRelationInput;
            },
        }),
    }),
});
