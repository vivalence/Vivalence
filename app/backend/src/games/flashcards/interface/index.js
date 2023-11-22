import Mustache from "mustache";

import { prisma } from "../../../prisma-client.js";
import { builder } from "../../../pothos-client/builder.js";

import GameUnitRelation from "../logic/gameUnitRelation.js";
import { getNextGameUnit } from "../logic/getNextGameUnit.js";

//
//  INPUTS
//

builder.inputType("Game_Flashcards_GetCards_Input", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", required: true }),
        fetch: t.int({ required: true }),
        blacklist: t.stringList(),
    }),
});

builder.inputType("Game_Flashcards_UpdateCard_Input", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", required: true }),
        unitId: t.field({ type: "ID", required: true }),
        response: t.field({ type: "Game_Flashcards_ReviewResponses_Enum", required: true }),
    }),
});

//
// RESOLVERS
//

builder.queryFields((t) => ({
    Game_Flashcards_GetCards: t.field({
        type: ["Game_Flashcards_Card"],
        args: {
            input: t.arg({
                type: "Game_Flashcards_GetCards_Input",
                required: true,
            }),
        },
        resolve: async (root, { input }, _) => {
            try {
                const { gameId, blacklist, fetch } = input;
                const units = [];

                const game = await prisma.game.findUnique({
                    where: { id: gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });
                // if !game throw

                while (units.length < fetch) {
                    const unit = await getNextGameUnit({
                        blacklist,
                        gameId: gameId,
                        curriculumId: game.curriculumRelation.curriculumId,
                    });
                    if (!unit) break;

                    blacklist.push(unit.id);
                    units.push({ unit, mask: game.curriculumRelation.mask });
                }

                return units;
            } catch (e) {
                console.log("ERROR", e);
                throw e;
            }
        },
    }),
}));

builder.mutationFields((t) => ({
    Game_Flashcards_UpdateCard: t.field({
        type: "Game_Flashcards_UpdateCard_Response",
        args: {
            input: t.arg({
                type: "Game_Flashcards_UpdateCard_Input",
                required: true,
            }),
        },

        resolve: async (root, { input }, _) => {
            try {
                let gameUnitRelation = await GameUnitRelation.get(input);

                if (gameUnitRelation) {
                    gameUnitRelation = await GameUnitRelation.update(input, gameUnitRelation);
                } else {
                    gameUnitRelation = await GameUnitRelation.create(input);
                }

                return gameUnitRelation;
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

builder.objectType("Game_Flashcards_UpdateCard_Response", {
    fields: (t) => ({
        unitId: t.field({ type: "ID", resolve: ({ unitId }) => unitId }),
    }),
});

builder.objectType("Game_Flashcards_Card", {
    fields: (t) => ({
        unitId: t.field({ type: "ID", resolve: ({ unit }) => unit.id }),
        front: t.string({
            resolve: ({ mask, unit }, _, ctx) => {
                return Mustache.render(mask.data.front, unit.data);
            },
        }),
        back: t.string({
            resolve: ({ mask, unit }, args, ctx) => {
                return Mustache.render(mask.data.back, unit.data);
            },
        }),
    }),
});

// Enums
builder.enumType("Game_Flashcards_ReviewResponses_Enum", {
    values: ["KNOWN", "UNKNOWN", "GRADUATE"],
});
