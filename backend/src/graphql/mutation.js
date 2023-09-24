import { builder } from "./core.js";
import { updateReviewItem, getNextReviewItem } from "../games/spacedrepetition";

const reviewItemInput = builder.inputType("reviewItemInput", {
    fields: (t) => ({
        id: t.id({ required: true }),
        type: t.string({ required: true, type: "ReviewItemTypeEnum" }),
        response: t.string({ required: true, type: "ReviewResponseTypeEnum" })
    })
});

const reviewItemMutation = builder.mutationField("reviewItem", (t) =>
    t.field({
        type: "ReviewItem",
        description: ``,
        args: {
            input: t.arg({ type: "reviewItemInput", required: true })
        },
        resolve: async (root, args, { prisma }) => {
            // console.log("\n\n\n\n\n\n\n\n\n\n[MUTATION]\n");
            // console.log("reviewItemMutation", args.input);
            // this could be done without blocking
            await updateReviewItem(args.input);
            // console.log("Updated, now getting next");
            return await getNextReviewItem({ type: args.input.type });
        }
    })
);
