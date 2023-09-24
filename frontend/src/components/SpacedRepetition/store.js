import { graphql, query } from "$houdini";

import { writable, get } from "svelte/store";
import { ReviewItemQuery } from "./gql";

const defaultData = { fetching: true, error: false, item: false };

const createSRStore = async () => {
    const { subscribe, set, update } = writable(defaultData);
    //     const handleReview = async (success) => {
    //         console.log("handleReview", success, reviewItemStore);
    //         // const { reviewItem } = await ReviewItemQuery({ id, success });
    //         // reviewItemStore.set(reviewItem);
    //     };

    return {
        // reviewItem
        set,
        update,
        subscribe

        //         // review: handleReview
    };
};

export const reviewItem = await createSRStore();

// // const dataInit = (set, input = { id: null, type: null, success: null }) => {
// //     console.log("subscribed to reviewItem");
// //     const reviewItem = ReviewItemMutation.mutate({ input }).then((result) => {
// //         console.log("result", result);
// //         // set(reviewItem);
// //     });
// // };
