import { builder } from "../../../pothos-client/builder.js";
import { getNextGameUnit } from "../logic/getNextGameUnit.js";

// probably receives a unit and a mask and returns a card
builder.objectType("FlashcardsGameCard", {
    description: "One Card",
    fields: (t) => ({
        unitId: t.exposeID("id"),
        front: t.string({
            resolve: (root, _, ctx) => {
                console.log("cardRood", root);
                // make root.data
                // and root.mask.data
                // kiss
                // by somehow applying handlebars style replacement to the mask, using the root.data
            },
        }),
        // back: t.string({
        //     resolve: ({ unit, mask }, args, ctx) => {
        //         // root is called twice and contains {id: 1, unit, mask} or {id: 2, unit, mask}
        //         // return transformUnitToCardFront(root.unit, root.mask);
        //     },
        // }),
    }),
});

const cardRoot = {
    data: {
        type: "V",
        index: 4522,
        english: "to defy, stand up to",
        spanish: "desafiar",
        usedInEnglish: "he has the audacity to stand up to authority",
        usedInSpanish: "tiene la osadía de desafiar la autoridad",
    },
    unitType: "WORD",
    status: "PRIORITIZED",
    curriculumRelations: [
        {
            index: 4522,
            curriculumId: "clnt1os200000g04mn5i16991",
            unitId: "clnt09ma203tzg0nuiinglnw9",
        },
    ],
    gameRelations: [],
    mask: {
        data: {
            back: '<p class="text-3xl font-bold">{{spanish}}</p>\n        <p class="text-xl">{{usedInSpanish}}</p> ',
            front: '<p class="text-3xl font-bold">{{english}}</p>\n        <p class="text-xl">{{usedInEnglish}}</p>',
        },
    },
};

// called with {gameId, curriculumId, blacklist, fetch, (user)}
builder.objectType("FlashcardsSetupObject", {
    description: "The initial game setup for flashcards",
    fields: (t) => ({
        gameId: t.exposeID("ID", { resolve: (root) => root.gameId }),
        curriculumId: t.exposeID("ID", { resolve: (root) => root.curriculumId }),
        cards: t.field({
            type: ["FlashcardsGameCard"],
            resolve: async (root, _, { prisma }) => {
                const { mask } = await prisma.curriculumGameRelation.findUnique({
                    where: {
                        curriculumId: root.curriculumId,
                        gameId: root.gameId,
                    },
                    include: { mask: true },
                });

                const units = [];
                const blacklist = [...(root.blacklist || [])];
                const queueDebt = root.fetch - blacklist.length;
                let dry = false;

                while (!dry && units.length < queueDebt) {
                    const unit = await getNextGameUnit({
                        blacklist,
                        gameId: root.gameId,
                        curriculumId: root.curriculumId,
                    });
                    unit.mask = mask;
                    if (unit) {
                        blacklist.push(unit.id);
                        units.push(unit);
                    } else dry = true;
                }

                return units; // passed on to build FlashcardsSetupObject
            },
        }),
    }),
});

//OLD
//OLD
//OLD

// const ReviewObject = builder.prismaObject("Review", {
//     description: "A instance of review holds the ebisu model and the schedule",
//     fields: (t) => {
//         return {
//             id: t.exposeID("id"),
//             lastReview: t.expose("lastReview", { type: "DateTime" }),
//             nextReview: t.expose("nextReview", { type: "DateTime" }),
//             model: t.expose("model", { type: "JSON" }),
//             known: t.exposeBoolean("known"),
//             itemId: t.exposeString("itemId"),
//             status: t.field({ type: "StatusEnum", resolve: (root) => root.status }),
//             itemType: t.field({
//                 type: "ReviewItemTypeEnum",
//                 resolve: (root) => root.itemType
//             }),
//             word: t.relation("word")
//         };
//     }
// });
