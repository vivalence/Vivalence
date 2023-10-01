import { prisma } from "../../prisma-client.js";
import { getDateTimeInXHours, getTimeDifferenceFromNow } from "../../lib/time.js";
import { ReviewItemTypeEnumMap } from "../../graphql/types.js";
import { invertObj } from "../../lib/utils.js";
import * as ebisu from "./ebisu.js";

export async function updateReviewItem(input) {
    try {
        let reviewItem = await getReviewItem(input);
        // console.log("updateReviewItem input reviewItem", input, reviewItem);

        if (reviewItem) {
            reviewItem = await updateReviewModel(input, reviewItem);
        } else {
            reviewItem = await createReviewItem(input);
        }

        return reviewItem;
    } catch (e) {
        console.log("updateReviewItem ERROR", e);
        throw e;
    }
}

async function getReviewItem({ id, type }) {
    const queryResult = await prisma.review.findFirst({
        where: { [invertObj(ReviewItemTypeEnumMap)[type]]: { id } },
        include: {
            word: type === "WORD",
            conjugatedVerb: type === "CONJUGATED_VERB",
            verbStem: type === "VERB_STEM",
            verbEnding: type === "VERB_ENDING"
        }
    });
    return queryResult;
}

async function createReviewItem({ id, type, response }) {
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
    const model = ebisu.getDefaultModel(defautlModel);
    const nextReviewTime = ebisu.predictNextReviewTime(model);

    const data = {
        model,
        itemId: id,
        itemType: type,
        nextReview: getDateTimeInXHours(nextReviewTime),
        lastReview: new Date(),
        [invertObj(ReviewItemTypeEnumMap)[type]]: { connect: { id } }
    };
    const created = await prisma.review.create({ data, include: { word: true } });
    created["previousItemDelay"] = nextReviewTime;
    return created;
}

async function updateReviewModel({ id, type, response }, reviewItem) {
    const elapsedTime = getTimeDifferenceFromNow(reviewItem.lastReview);
    // console.log("updateReviewModel", elapsedTime);

    let model = null;
    let inputModel = reviewItem.model; // [ 4, 4, 0.24 ]
    let count = 0;
    while (model === null && count < 10) {
        console.log("updateReviewModel", count++);
        try {
            model = updateEbisuModel(inputModel, response, elapsedTime);
        } catch (e) {
            inputModel = ebisu.scaleModel(inputModel, 1.1);
            // console.log("updateReviewModel ERROR", e);
        }
    }

    const nextReview = ebisu.predictNextReviewTime(model);

    const newReviewItem = await prisma.review.update({
        where: { id: reviewItem.id },
        data: { model, nextReview: getDateTimeInXHours(nextReview), lastReview: new Date() }
    });
    newReviewItem["previousItemDelay"] = nextReview;
    return newReviewItem;
}
// try {
//     const tau = 0.44;
//     const time = 16.09;
//     const model = [5, 5, tau];
//     const update = ebisu.updateModel(model, 0, 1, time);
//     console.log("update", update);
// } catch (e) {
//     console.log(e);
// }

const updateEbisuModel = (model, response, elapsedTime) => {
    switch (response) {
        case "GRADUATE":
            model = ebisu.updateModel(model, 1, 1, elapsedTime);
            model = ebisu.scaleModel(model, 10);
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
};
