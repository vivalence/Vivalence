import { prisma } from "../../prisma";
import { getDateTimeInXHours, getTimeDifferenceFromNow } from "../../lib/time.js";
import { ReviewItemTypeEnumMap } from "../../graphql/types.js";
import { invertObj } from "../../lib/utils.js";
import * as ebisu from "./ebisu";

export async function updateReviewItem(input) {
    try {
        let reviewItem = await getReviewItem(input);
        console.log("updateReviewItem input reviewItem", input, reviewItem);

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
            word: type === "WORD"
            // conjugatedVerb: type === "CONJUGATED_VERB",
            // verbStem: type === "VERB_STEM",
            // verbEnding: type === "VERB_ENDING"
        }
    });
    return queryResult;
}

async function createReviewItem({ id, type, response }) {
    const tau = response == "GRADUATE" ? 24 : response == "KNOWN" ? 24 : 1;
    const model = ebisu.getDefaultModel({ tau });
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
    return created;
}

async function updateReviewModel({ id, type, response }, reviewItem) {
    const elapsedTime = getTimeDifferenceFromNow(reviewItem.lastReview);

    const model =
        response == "GRADUATE"
            ? ebisu.scaleModel(ebisu.updateModel(reviewItem.model, 1, 1, elapsedTime), 10)
            : ebisu.updateModel(reviewItem.model, response == "KNOWN" ? 1 : 0, 1, elapsedTime);

    const nextReview = ebisu.predictNextReviewTime(model);

    return await prisma.review.update({
        where: { id: reviewItem.id },
        data: { model, nextReview: getDateTimeInXHours(nextReview), lastReview: new Date() }
    });
}
// try {
//     const tau = 0.0607;
//     const time = 3.56;
//     const model = [4, 4, tau];
//     ebisu.updateModel(model, 1, 1, time);
// } catch (e) {
//     console.log(e);
// }
