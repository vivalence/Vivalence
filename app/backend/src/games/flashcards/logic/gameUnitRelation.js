import { getDateTimeInXHours, getTimeDifferenceFromNow } from "../../../utils/time.js";
import { prisma } from "../../../prisma-client.js";

import * as ebisu from "./ebisu.js";

// export async function updateGameUnitRelation(gameUnitRelationUpdate) {
//     try {
//     } catch (e) {
//         console.log("updateReviewItem ERROR", e);
//         throw e;
//     }
// }

async function create({ unitId, gameId, response }) {
    const model = getDefaultEbisuModel(response);
    const nextReviewTime = ebisu.predictNextReviewTime(model);

    const data = {
        state: model,
        gameId,
        unitId,
        nextPlay: getDateTimeInXHours(nextReviewTime),
        lastPlay: new Date(),
        history: [],
    };
    const created = await prisma.gameUnitRelation.create({ data });
    // created["previousItemDelay"] = nextReviewTime;
    return created;
}

async function get({ unitId, gameId }) {
    const queryResult = await prisma.gameUnitRelation.findFirst({
        where: { unitId, gameId },
    });
    return queryResult;
}

async function update({ unitId, gameId, response }, gameUnitRelation) {
    const now = new Date();
    const elapsedTime = getTimeDifferenceFromNow(gameUnitRelation.lastPlay);
    const model = updateEbisuModel(gameUnitRelation.state, response, elapsedTime);

    const nextPlay = getDateTimeInXHours(ebisu.predictNextReviewTime(model));

    const history = [
        ...gameUnitRelation.history,
        {
            state: gameUnitRelation.state,
            lastPlay: gameUnitRelation.lastPlay,
            nextPlay,
            now,
        },
    ];

    const gameUnitRelationUpdate = await prisma.gameUnitRelation.update({
        where: { id: gameUnitRelation.id },
        data: {
            state: model,
            history,
            nextPlay,
            lastPlay: now,
            unit: {
                update: {
                    status: getUnitStatus(elapsedTime, response),
                },
            },
        },
    });
    // gameUnitRelationUpdate["previousItemDelay"] = getDelayTime(gameUnitRelation, nextReview);
    return gameUnitRelationUpdate;
}

export default { get, create, update };

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
