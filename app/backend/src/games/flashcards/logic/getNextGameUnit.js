import { prisma } from "../../../prisma-client.js";

export const getNextGameUnit = async ({ blacklist, curriculumId, gameId, type = "WORD" }) => {
    // console.log("getNextGameUnit props", { blacklist, curriculumId, gameId, type });
    try {
        const input = {
            blacklist,
            curriculumId,
            gameId,
            now: new Date(),
        };

        const prioritizedUnit = await getPrioritizedUnit(input);
        if (prioritizedUnit) return prioritizedUnit;

        const dueUnit = await getDueUnit(input);
        if (dueUnit) return dueUnit;

        const newUnit = await getNewUnit(input);
        if (newUnit) return newUnit;

        console.log("No items to practice now");
        return null;
    } catch (err) {
        console.error(`Error fetching next review item: ${err}`);
        throw err; // or handle the error as you see fit
    }
};

const getPrioritizedUnit = async ({ blacklist, curriculumId, gameId, type }) => {
    return await prisma.unit.findFirst({
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
};

const getDueUnit = async ({ blacklist, curriculumId, gameId, type, now }) => {
    const relation = await prisma.gameUnitRelation.findFirst({
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
    return relation ? relation.unit : null;
};

const getNewUnit = async ({ blacklist, curriculumId, gameId, type }) => {
    return await prisma.unit.findFirst({
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
};
