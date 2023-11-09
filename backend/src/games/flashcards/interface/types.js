import Mustache from "mustache";

import { builder } from "../../../pothos-client/builder.js";
import { prisma } from "../../../prisma-client.js";

import { getNextGameUnit } from "../logic/getNextGameUnit.js";
import GameUnitRelation from "../logic/gameUnitRelation.js";

// INPUTS
builder.inputType("FlashcardsGameUnitRelationInput", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", required: true }),
        unitId: t.field({ type: "ID", required: true }),
        response: t.field({ type: "FlashcardsGameReviewResponses", required: true }),
    }),
});
builder.inputType("FlashcardsGamePlayStateInput", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", required: true }),
        fetch: t.int({ required: true }),
        blacklist: t.stringList(),
    }),
});

// Shared Return Types

builder.objectType("FlashcardsGameUnitRelationUpdate", {
    fields: (t) => ({
        gameUnitRelation: t.field({
            type: "GameUnitRelation",
            resolve: async (gameUnitRelationInput) => {
                let gameUnitRelation = await GameUnitRelation.get(gameUnitRelationInput);

                if (gameUnitRelation) {
                    gameUnitRelation = await GameUnitRelation.update(
                        gameUnitRelationInput,
                        gameUnitRelation,
                    );
                } else {
                    gameUnitRelation = await GameUnitRelation.create(gameUnitRelationInput);
                }

                return gameUnitRelation;
            },
        }),
    }),
});

builder.objectType("FlashcardsGamePlayStateUpdate", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", resolve: ({ gameId }) => gameId }),
        newCards: t.field({
            type: ["FlashcardsGameCard"],
            resolve: async (gamePlayStateInput) => {
                const { gameId, blacklist, fetch } = gamePlayStateInput;
                const units = [];

                const { curriculumRelation } = await prisma.game.findUnique({
                    where: { id: gameId },
                    include: { curriculumRelation: { include: { mask: true } } },
                });

                while (units.length < fetch) {
                    const unit = await getNextGameUnit({
                        blacklist,
                        gameId: gameId,
                        curriculumId: curriculumRelation.curriculumId,
                    });
                    if (!unit) break;

                    blacklist.push(unit.id);
                    units.push({ unit, mask: curriculumRelation.mask });
                }

                return units;
            },
        }),
    }),
});

builder.objectType("FlashcardsGameCard", {
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

builder.enumType("FlashcardsGameReviewResponses", {
    values: ["KNOWN", "UNKNOWN", "GRADUATE"],
});
