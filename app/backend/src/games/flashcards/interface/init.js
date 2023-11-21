import { builder } from "../../../pothos-client/builder.js";
import { prisma } from "../../../prisma-client.js";

builder.queryFields((t) => ({
    flashcardsInit: t.field({
        type: "FlashcardsInit",
        args: {
            gameStateInput: t.arg({ type: "FlashcardsGameStateInput", required: true }),
        },
        resolve: async (root, args) => args,
    }),
}));

// RETURN TYPE
builder.objectType("FlashcardsInit", {
    fields: (t) => ({
        gameStateUpdate: t.field({
            type: "FlashcardsGameStateUpdate",
            resolve: async ({ gameStateInput }, _) => {
                return gameStateInput;
            },
        }),
    }),
});
