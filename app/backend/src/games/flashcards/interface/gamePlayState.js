import { builder } from "../../../pothos-client/builder.js";

// INPUTS
builder.inputType("FlashcardsGameStateInput", {
    fields: (t) => ({
        gameId: t.field({ type: "ID", required: true }),
        fetch: t.int({ required: true }),
        blacklist: t.stringList(),
    }),
});

// RESPONSE
builder.objectType("FlashcardsGameStateUpdate", {
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
