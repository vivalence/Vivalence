import { prisma } from "../../prisma";

export const getNextReviewItem = async ({ type }) => {
    try {
        const now = new Date();
        const buildReviewItem = getReviewItemBuilder(type);

        // 1. fetch the next item to review
        const review = await prisma.review.findFirst({
            where: {
                itemType: type,
                nextReview: { lt: now }
            },
            orderBy: [
                {
                    nextReview: "asc"
                }
            ],
            include: {
                word: type === "WORD"
                // conjugatedVerb: type === "CONJUGATED_VERB",
                // verbStem: type === "VERB_STEM",
                // verbEnding: type === "VERB_ENDING"
            }
        });
        if (review) {
            return buildReviewItem("REVIEW", review);
        }

        //
        // if no review is available
        // get new item to review
        //

        const word = await prisma.word.findFirst({
            where: {
                review: null
            },
            orderBy: [
                {
                    index: "asc"
                }
            ]
        });

        if (word) {
            return buildReviewItem("WORD", word);
        }

        console.log("No items to practice now");
        return null;
    } catch (err) {
        console.error(`Error fetching next review item: ${err}`);
        throw err; // or handle the error as you see fit
    }
};

// usage
const buildWordRreviewItem = (itemType, item) => {
    switch (itemType) {
        case "REVIEW":
            return {
                id: item.word.id,
                type: "WORD",
                front: item.word.english,
                back: item.word.spanish
            };
        case "WORD":
            return {
                id: item.id,
                type: "WORD",
                front: item.english,
                back: item.spanish
            };
    }
};

const getReviewItemBuilder = (type) => {
    switch (type) {
        case "WORD":
            return buildWordRreviewItem;
    }
};
