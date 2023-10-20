import { builder } from "../../../pothos-client/builder.js";

builder.queryFields((t) => ({
    flashcardsInit: t.field({
        type: "FlashcardsSetupObject",
        description: "Initialize the flashcards game. Returns the first review items.",
        args: {
            gameId: t.arg.id({ type: "ID", required: true }),
            fetch: t.arg.int({ required: true }),
            blacklist: t.arg.stringList(),
        },
        resolve: async (root, { gameId, blacklist, fetch }, { prisma }) => {
            const {
                curriculumRelation: { curriculumId },
            } = await prisma.game.findUnique({
                where: { id: gameId },
                include: { curriculumRelation: true },
            });
            return { fetch, blacklist, curriculumId, gameId };
        },
    }),
}));

// OLD
// OLD
// OLD

// const reviewItemQuery = builder.queryField("reviewItem", (t) => {
//     return t.field({
//         type: "ReviewItem",
//         args: {
//             type: t.arg({ type: "String", required: true, default: "WORD" })
//         },
//         resolve: async (root, args, { prisma }) => {
//             // console.log("\n\n\n\n\n\n\n\n\n\n[QUERY]\n");
//             const next = await getNextReviewItem({ type: args.type });
//             // console.log("next", next);
//             // next.previousItemDelay = 0;
//             return next;
//         }
//     });
// });

// first fetch all units where
// when i prioritize a unit, do i want to read it imediately?
// yes
// then how do i keep the units from doubling up?
// if i return a prioritized unit
// and a loop happens
// that same unit will get called again first.
// so how do i work with units across fetch sources and queues.
// i could pass a list of unit ids. but i wanna look for an emergent solution. best part is no part.
// no emergent possible.
// on the refetch there will allways be duplicates if no list is given
