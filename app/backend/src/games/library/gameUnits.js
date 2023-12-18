import { prisma } from "../../prisma-client.js";
import { log } from "../../library/logging.js";

const STATUS = ["UNKNOWN", "LEARNING", "KNOWN"];
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
        const getters = [
            [getPrioritizedUnits, "getPrioritizedUnits"],
            [getDueUnits, "getDueUnits"],
            [getNewUnits, "getNewUnits"],
        ];
        let take = inputs.take;
        const units = [];

        for (const [getter, funName] of getters) {
            if (units.length >= take) break;

            const newUnits = await getter(inputs);
            if (newUnits.length === 0) continue;

            log("getUnits", {
                gameId: inputs.gameId,
                tags: inputs.tags,
                [funName]: newUnits.length,
                units: newUnits.map(({ id }) => id),
            });

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
    due_lt = new Date(),
    take = 1,
}) => {
    const where = {
        status: "PRIORITIZED",
        curriculumRelations: { some: { curriculumId } },
        OR: [
            {
                gameRelations: { none: { gameId } },
            },

            {
                gameRelations: { some: { AND: [{ gameId }, { nextPlay: { lt: due_lt } }] } },
            },
        ],
    };

    if (tags.length > 0) where["AND"] = tags.map((tag) => ({ tags: { some: { name: tag } } }));
    if (blacklist.length > 0) where["id"] = { notIn: blacklist };

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
            OR: [{ status: { notIn: ["HIDDEN"] } }, { status: null }],
            curriculumRelations: { some: { curriculumId } },
        },
    };

    if (status.length > 0) where.unit["memoryModels"] = { some: { status: { in: status } } };
    if (blacklist.length > 0) where.unit["id"] = { notIn: blacklist };
    if (tags.length > 0) where.unit["AND"] = tags.map((tag) => ({ tags: { some: { name: tag } } }));

    const relations = await prisma.gameUnitRelation.findMany({
        where,
        orderBy: { nextPlay: "asc" },
        select: {
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
            OR: [{ status: { notIn: ["HIDDEN"] } }, { status: null }],
            gameRelations: { none: { gameId } },
        },
    };

    if (blacklist.length > 0) where.unit["id"] = { notIn: blacklist };
    if (tags.length > 0) where.unit["AND"] = tags.map((tag) => ({ tags: { some: { name: tag } } }));

    // console.log("queryInput", {where, orderBy: { index: "asc" }, select: {unit: {include: {tags: { select: { name: true } },},},}, take,});
    const relations = await prisma.curriculumUnitRelation.findMany({
        where,
        orderBy: { index: "asc" },
        select: {
            unit: {
                include: {
                    tags: { select: { name: true } },
                },
            },
        },
        take,
    });
    // console.log("relations.length", relations.length);
    return relations.map(({ unit }) => unit);
};
