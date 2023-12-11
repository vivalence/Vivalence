import Mustache from "mustache";
import { prisma } from "../../prisma-client.js";
import { builder } from "../../pothos-client/builder.js";
import { log } from "../../library/logging.js";

import GameUnitRelation from "../library/gameUnitRelation.js";
import { getUnits } from "../library/gameUnits.js";

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
                const { gameId, blacklist = [], fetch } = input;
                log("Game_Flashcards_GetCards_Input", input, "api");

                const game = await prisma.game.findUnique({
                    where: { id: gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });
                if (!game) throw new Error("Game not found");

                const units = await getUnits({
                    blacklist,
                    gameId: gameId,
                    curriculumId: game.curriculumRelation.curriculumId,
                    take: fetch,
                });

                log(
                    "Game_Flashcards_GetCards_Response",
                    { units: units.map((unit) => unit.id) },
                    "api",
                );
                return units.map((unit) => ({ unit, mask: game.curriculumRelation.mask }));
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
                const { gameId, unitId, response } = input;
                log("Game_Flashcards_UpdateCard_Input", input, "api");

                const relation = await GameUnitRelation.handle({ gameId, unitId, response });

                log(
                    "Game_Flashcards_UpdateCard_Response",
                    {
                        gameId,
                        unitId,
                        nextPlay: relation.nextPlay,
                        model: relation.state,
                    },
                    "api",
                );

                return relation;
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

// might want to migrate this to a more useful & shared type
// like a GameUnitRelationUpdateResponse type or so
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
                return Mustache.render(mask.data[unit.unitType].front, unit.data);
            },
        }),
        back: t.string({
            resolve: ({ mask, unit }, args, ctx) => {
                return Mustache.render(mask.data[unit.unitType].back, unit.data);
            },
        }),
    }),
});

// Enums
builder.enumType("Game_Flashcards_ReviewResponses_Enum", {
    values: ["KNOWN", "UNKNOWN", "GRADUATE"],
});
