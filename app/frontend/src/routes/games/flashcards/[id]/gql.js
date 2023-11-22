import { graphql } from "$houdini";

// this is so fucking retarded
// export const GetCards_Query = graphql(`
//     query GetCards($input: Game_Flashcards_GetCards_Input!) {
//         Game_Flashcards_GetCards(input: $input) {
//             unitId
//             front
//             back
//         }
//     }
// `);
// console.log("GetCards_Query ", GetCards_Query);

export const UpdateCard_Mutation = graphql(`
    mutation UpdateCard($input: Game_Flashcards_UpdateCard_Input!) {
        Game_Flashcards_UpdateCard(input: $input) {
            unitId
        }
    }
`);

// console.log("UpdateCard_Mutation ", UpdateCard_Mutation);
