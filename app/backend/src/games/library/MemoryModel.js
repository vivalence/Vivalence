import { getDateTimeInXHours, getTimeDifferenceFromNow } from "../../utils/time.js";
import { prisma } from "../../prisma-client.js";
import * as ebisu from "../../library/ebisu.js";

async function create({ unitId, response, gameType }) {
    const model = getDefaultEbisuModel(response);
    const nextReviewTime = ebisu.predictNextReviewTime(model);
    const nextPlay = getDateTimeInXHours(nextReviewTime);
    const now = new Date();

    const data = {
        unit: { connect: { id: unitId } },
        type: "EBISU_v2",
        status: "LEARNING",
        lastSeen: now,
        state: model,
        history: [{ gameType, response, model, nextPlay, now }],
    };

    const created = await prisma.memoryModel.create({ data });

    return { memoryModel: created, nextPlay };
}

async function read({ unitId }) {
    const queryResult = await prisma.memoryModel.findFirst({
        where: { unitId },
        include: { unit: true },
    });
    return queryResult;
}

async function update({ unitId, response, gameType }, memoryModel) {
    const now = new Date();
    const elapsedTime = getTimeDifferenceFromNow(memoryModel.lastSeen);
    const model = updateEbisuModel(memoryModel.state, response, elapsedTime);
    const nextPlay = getDateTimeInXHours(ebisu.predictNextReviewTime(model));

    const history = [
        ...memoryModel.history,
        {
            gameType,
            response,
            model,
            nextPlay,
            now,
        },
    ];

    const update = await prisma.memoryModel.update({
        where: { id: memoryModel.id },
        data: {
            state: model,
            status: "LEARNING",
            lastSeen: now,
            history,
        },
    });
    return { memoryModel: update, nextPlay };
}

async function handle({ unitId, gameType, response }) {
    const input = { unitId, gameType, response };

    let nextPlay;
    let memoryModel = await read(input);

    if (memoryModel) {
        const updated = await update(input, memoryModel);
        memoryModel = updated.memoryModel;
        nextPlay = updated.nextPlay;
    } else {
        const created = await create(input);
        memoryModel = created.memoryModel;
        nextPlay = created.nextPlay;
    }

    return { memoryModel, nextPlay };
}

export default {
    create,
    read,
    update,
    handle,
};

// const getDelayTime = (gameUnitRelation, nextReviewInHours) => {// difference between (reviewItem.lastreview to now) and (nextreview to now) in hours const lastPredictionDifference = (reviewItem.nextReview - gameUnitRelation.lastReview) / (1000 * 60 * 60); console.log("item", gameUnitRelation.word.spanish); console.log("previous", lastPredictionDifference); console.log("next", nextReviewInHours); const delay = nextReviewInHours - lastPredictionDifference; return delay;};

function getUnitStatus(elapsedTime, response) {
    if (elapsedTime > 24 * 7 && ["GRADUATE", "KNOWN"].includes(response)) {
        return "KNOWN";
    } else {
        return "LEARNING";
    }
}

function getDefaultEbisuModel(response) {
    let defautlModel = {};
    switch (response) {
        case "GRADUATE":
            defautlModel.tau = 24;
            break;
        case "KNOWN":
            defautlModel.tau = 3.4;
            break;
        case "UNKNOWN":
            defautlModel.tau = 0.26;
            break;
        default:
            throw new Error(`Invalid response: ${response}`);
    }
    return ebisu.getDefaultModel(defautlModel);
}

function updateEbisuModel(model, response, elapsedTime) {
    switch (response) {
        case "GRADUATE":
            model = ebisu.updateModel(model, 1, 1, elapsedTime);
            model = ebisu.scaleModel(model, 5);
            break;
        case "KNOWN":
            model = ebisu.updateModel(model, 1, 1, elapsedTime);
            break;
        case "UNKNOWN":
            model = ebisu.updateModel(model, 0, 1, elapsedTime);
            break;
        default:
            throw new Error(`Invalid response: ${response}`);
    }

    return model;
}
