import { prisma } from "../../prisma-client.js";

export const getPrioritizedUnit = async ({
    curriculumId,
    gameId,
    blacklist = [],
    type = "WORD",
}) => {
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

export const getDueUnit = async ({
    curriculumId,
    gameId,
    blacklist = [],
    type = "WORD",
    now = new Date(),
}) => {
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

export const getNewUnit = async ({ curriculumId, gameId, blacklist = [], type = "WORD" }) => {
    const relation = await prisma.curriculumUnitRelation.findFirst({
        where: {
            curriculumId,
            unit: {
                status: { notIn: ["HIDDEN", "GRADUATED"] },
                unitType: type,
                id: { notIn: blacklist },
                gameRelations: { none: { gameId } },
            },
        },
        orderBy: { index: "asc" },
        include: {
            unit: true,
        },
    });
    return relation ? relation.unit : null;
};
