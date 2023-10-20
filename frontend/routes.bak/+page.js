import { graphql } from "$houdini";
// import { mutation, query } from "$houdini";
// import { ReviewItemQuery } from "../components/SpacedRepetition/gql";
// import { reviewItem } from "../components/SpacedRepetition/store";

import { load_ReviewItemQuery } from "$houdini";

export const _ReviewItemQueryVariables = (event) => ({ type: "WORD" });

export const _houdini_load = graphql(`
    query ReviewItemQuery($type: String!) {
        reviewItem(type: $type) {
            id
            type
            back
            front
            previousItemDelay
        }
    }
`);

// export async function load({ session }) {
// const { data } = await load({ session }).fetch(ReviewItemQuery);
// console.log("LOAD", load_ReviewItemQuery);
// console.log("ReviewItemQuery", ReviewItemQuery);
// if (data && data.ReviewItemQuery) {
//     reviewItemStore.set(data.ReviewItemQuery); // update the store
// }
// return {
//     ReviewItemQuery: data,
//     reviewItem
// };
// }
