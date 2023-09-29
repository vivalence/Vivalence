import { builder } from "./core.js";
import { getNextReviewItem } from "../games/spacedrepetition/index.js";

const wordsQuery = builder.queryField("words", (t) =>
    t.field({
        type: ["Word"],
        resolve: () => [
            {
                index: 1,
                spanish: "hola",
                english: "hello"
            }
        ]
    })
);

const ReviewItemObject = builder.objectType("ReviewItem", {
    description:
        "An item that can be reviewed in the context of spaced repetition. Exposed to the client.",
    fields: (t) => {
        return {
            id: t.exposeID("id"),
            type: t.field({
                type: "ReviewItemTypeEnum",
                resolve: (root) => root.type
            }),
            front: t.exposeString("front"),
            back: t.exposeString("back")
        };
    }
});

const reviewItemQuery = builder.queryField("reviewItem", (t) => {
    return t.field({
        type: "ReviewItem",
        args: {
            type: t.arg({ type: "String", required: true, default: "WORD" })
        },
        resolve: async (root, args, { prisma }) => {
            // console.log("\n\n\n\n\n\n\n\n\n\n[QUERY]\n");
            const next = await getNextReviewItem({ type: args.type });
            // console.log("next", next);
            return next;
        }
    });
});
