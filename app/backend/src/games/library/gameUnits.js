import { prisma } from "../../prisma-client.js";

const STATUS = ["PRIORITIZED", "UNKNOWN", "LEARNING", "KNOWN"];
// const {
//     take = 1,
//     status = STATUS,
//     tags = [],
//     due_lt = new Date(),
//     blacklist = [],
//     curriculumId,
//     gameId,
// } = inputs;
export async function getUnits(inputs) {
    try {
        const getters = [getPrioritizedUnits, getDueUnits, getNewUnits];
        let take = inputs.take;
        const units = [];

        for (const getUnits of getters) {
            if (units.length >= take) break;

            const newUnits = await getUnits(inputs);
            if (newUnits.length === 0) continue;

            units.push(...newUnits);
            inputs.take -= newUnits.length;
        }

        return units;
    } catch (err) {
        console.error(`Error fetching next review item: ${err}`);
        throw err; // or handle the error as you see fit
    }
}
export const getPrioritizedUnit = async (inputs) => {
    inputs["take"] = 1;
    const units = await getPrioritizedUnits(inputs);
    return units[0];
};
export const getPrioritizedUnits = async ({
    curriculumId,
    gameId,
    blacklist = [],
    tags = [],
    take = 1,
}) => {
    const where = {
        status: "PRIORITIZED",
        curriculumRelations: { some: { curriculumId } },
    };

    if (tags.length > 0) where["AND"] = tags.map((tag) => ({ tags: { some: { name: tag } } }));
    if (blacklist.length > 0) where.unit["id"] = { notIn: blacklist };

    return await prisma.unit.findMany({
        where,
        include: {
            curriculumRelations: { where: { curriculumId } },
            gameRelations: { where: { gameId } },
            tags: { select: { name: true } },
        },
        take,
    });
};

export const getDueUnit = async (inputs) => {
    inputs["take"] = 1;
    const relations = await getDueUnits(inputs);
    return relations[0] ? relation[0].unit : null;
};
export const getDueUnits = async ({
    curriculumId,
    gameId,
    status = STATUS,
    tags = [],
    due_lt = new Date(),
    blacklist = [],
    take = 1,
}) => {
    const where = {
        gameId,
        nextPlay: { lt: due_lt },
        unit: {
            curriculumRelations: { some: { curriculumId } },
        },
    };

    if (status.length > 0) where.unit["status"] = { in: status };
    if (blacklist.length > 0) where.unit["id"] = { notIn: blacklist };
    if (tags.length > 0) where.unit["AND"] = tags.map((tag) => ({ tags: { some: { name: tag } } }));

    const relations = await prisma.gameUnitRelation.findMany({
        where,
        orderBy: { nextPlay: "asc" },
        include: {
            unit: {
                include: {
                    curriculumRelations: { where: { curriculumId } },
                    gameRelations: { where: { gameId } },
                    tags: { select: { name: true } },
                },
            },
        },
        take,
    });

    return relations.map(({ unit }) => unit);
};

export const getNewUnit = async (inputs) => {
    inputs["take"] = 1;
    const relations = await getNewUnits(inputs);
    return relations[0] ? relation[0].unit : null;
};
export const getNewUnits = async (inputs) => {
    const { curriculumId, gameId, tags = [], status = STATUS, blacklist = [], take = 1 } = inputs;

    const where = {
        curriculumId,
        unit: {
            gameRelations: { none: { gameId } },
        },
    };

    if (status.length > 0) where.unit["status"] = { in: status };
    if (blacklist.length > 0) where.unit["id"] = { notIn: blacklist };
    if (tags.length > 0) where.unit["AND"] = tags.map((tag) => ({ tags: { some: { name: tag } } }));

    const relations = await prisma.curriculumUnitRelation.findMany({
        where,
        orderBy: { index: "asc" },
        include: {
            unit: {
                include: {
                    tags: { select: { name: true } },
                },
            },
        },
        take,
    });
    return relations.map(({ unit }) => unit);
};
