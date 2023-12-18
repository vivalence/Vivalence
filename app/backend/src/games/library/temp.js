import { getDateTimeInXHours, getTimeDifferenceFromNow } from "../../utils/time.js";
import { prisma } from "../../prisma-client.js";
import * as ebisu from "../../library/ebisu.js";

async function create({ unitId, gameId, response, nextPlay }) {
    const lastPlay = new Date();

    const data = {
        gameId,
        unitId,
        nextPlay,
        lastPlay,
        history: [{ response, nextPlay, now: lastPlay }],
    };
    const created = await prisma.gameUnitRelation.create({ data });
    return created;
}

async function read({ unitId, gameId }) {
    const queryResult = await prisma.gameUnitRelation.findFirst({
        where: { unitId, gameId },
        include: { game: { select: { type: true } } },
    });
    return queryResult;
}

async function update({ unitId, gameId, nextPlay, response }, gameUnitRelation) {
    const now = new Date();
    const history = [...gameUnitRelation.history, { response, nextPlay, now }];

    const gameUnitRelationUpdate = await prisma.gameUnitRelation.update({
        where: { id: gameUnitRelation.id },
        data: { history, nextPlay, lastPlay: now },
    });
    return gameUnitRelationUpdate;
}

async function handle({ gameId, unitId, nextPlay, response }) {
    const input = { gameId, unitId, nextPlay, response };

    let gameUnitRelation = await read(input);

    if (gameUnitRelation) {
        gameUnitRelation = await update(input, gameUnitRelation);
    } else {
        gameUnitRelation = await create(input);
    }

    return gameUnitRelation;
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
