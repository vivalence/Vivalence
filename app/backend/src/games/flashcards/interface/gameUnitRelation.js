import GameUnitRelation from "../logic/gameUnitRelation.js";
import { builder } from "../../../pothos-client/builder.js";

// INPUTS
builder.inputType("FlashcardsGameUnitRelationInput", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", required: true }),
        unitId: t.field({ type: "ID", required: true }),
        response: t.field({ type: "FlashcardsGameReviewResponses", required: true }),
    }),
});

// RESPONSE
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
