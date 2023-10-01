import { prisma } from "../../prisma-client.js";

export const getNextReviewItem = async ({ type }) => {
    try {
        const now = new Date();
        const buildReviewItem = getReviewItemBuilder(type);

        // 1. fetch the next item to review
        const review = await prisma.review.findFirst({
            // where not word.status is "ACTIVE"
            where: {
                itemType: type,
                word: {
                    status: "ACTIVE"
                },

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

// omg so ugly.
const buildGameCard = (item, gameType = "SPACEDREPETITION") => {
    switch (gameType) {
        case "SPACEDREPETITION":
            return `<p class="text-3xl font-bold">${item.header}</p>
        <p class="text-xl">${item.body}</p>
`;
    }
};
const buildWordRreviewItem = (itemType, item) => {
    // console.log("buildWordRreviewItem", itemType, item);
    switch (itemType) {
        case "REVIEW":
            return {
                id: item.word.id,
                type: "WORD",
                front: buildGameCard({
                    header: item.word.english,
                    body: item.word.usageInEnglish
                }),
                back: buildGameCard({ header: item.word.spanish, body: item.word.usageInSpanish })
            };
        case "WORD":
            return {
                id: item.id,
                type: "WORD",
                front: buildGameCard({ header: item.english, body: item.usageInEnglish }),
                back: buildGameCard({ header: item.spanish, body: item.usageInSpanish })
            };
    }
};

const getReviewItemBuilder = (type) => {
    switch (type) {
        case "WORD":
            return buildWordRreviewItem;
    }
};
