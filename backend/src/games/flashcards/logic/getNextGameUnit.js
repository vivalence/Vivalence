import { prisma } from "../../../prisma-client.js";

export const getNextGameUnit = async ({ blacklist, curriculumId, gameId, type = "WORD" }) => {
    // console.log("getNextGameUnit props", { blacklist, curriculumId, gameId, type });
    try {
        const now = new Date();
        // 0. start by fetching prioritized units
        const prioritizedUnit = await prisma.unit.findFirst({
            where: {
                status: "PRIORITIZED",
                unitType: type,
                id: { notIn: blacklist },
                curriculumRelations: { some: { curriculumId } },
            },
            include: {
                curriculumRelations: { where: { curriculumId } },
                gameRelations: { where: { gameId } },
            },
        });
        // console.log("prioritizedUnit", !!prioritizedUnit);
        if (prioritizedUnit) return prioritizedUnit;

        // 1. fetch from all the units that had are due
        const gameUnitRelation = await prisma.gameUnitRelation.findFirst({
            where: {
                gameId,
                nextPlay: { lt: now },
                unit: {
                    status: { in: ["LEARNING", "KNOWN"] },
                    unitType: type,
                    id: { notIn: blacklist },
                },
            },
            orderBy: [{ nextPlay: "asc" }],
            include: {
                unit: {
                    include: {
                        curriculumRelations: { where: { curriculumId } },
                        gameRelations: { where: { gameId } },
                    },
                },
            },
        });
        // console.log("gameUnitRelation", !!gameUnitRelation);
        if (gameUnitRelation) return gameUnitRelation.unit;

        // 2. if no review is available, get new item to review
        const newUnit = await prisma.unit.findFirst({
            where: {
                status: { in: ["UNKNOWN", "PRIORITIZED"] },
                unitType: type,
                id: { notIn: blacklist },
                curriculumRelations: { some: { curriculumId } },
            },
            include: {
                curriculumRelations: { where: { curriculumId } },
                gameRelations: { where: { gameId } },
            },
            orderBy: [{ index: "asc" }],
        });
        // console.log("newUnit", !!newUnit);
        if (newUnit) return newUnit;

        console.log("No items to practice now");
        return null;
    } catch (err) {
        console.error(`Error fetching next review item: ${err}`);
        throw err; // or handle the error as you see fit
    }
};

// omg so ugly.
// const buildGameCard = (item, gameType = "SPACEDREPETITION") => {
//     switch (gameType) {
//         case "SPACEDREPETITION":
//             return;
//     }
// };
// {"type": "NF", "index": 344, "english": "", "spanish": "", "usedInEnglish": "", "usedInSpanish": ""}

// const buildWordRreviewItem = (itemType, item) => {
//     // console.log("buildWordRreviewItem", itemType, item);
//     switch (itemType) {
//         case "REVIEW":
//             return {
//                 id: item.word.id,
//                 type: "WORD",
//                 front: buildGameCard({
//                     header: item.word.english,
//                     body: item.word.usageInEnglish,
//                 }),
//                 back: buildGameCard({ header: item.word.spanish, body: item.word.usageInSpanish }),
//             };
//         case "WORD":
//             return {
//                 id: item.id,
//                 type: "WORD",
//                 front: buildGameCard({ header: item.english, body: item.usageInEnglish }),
//                 back: buildGameCard({ header: item.spanish, body: item.usageInSpanish }),
//             };
//     }
// };

// const getReviewItemBuilder = (type) => {
//     switch (type) {
//         case "WORD":
//             return buildWordRreviewItem;
//     }
// };
