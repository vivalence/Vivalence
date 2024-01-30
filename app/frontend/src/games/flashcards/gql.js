import { graphql } from "$houdini";

// import { FLASHCARDS_QUEUE_SIZE } from "./settings.js";

// export const GetCards_Query = graphql(` query GetCards($input: Game_Flashcards_GetCards_Input!) {Game_Flashcards_GetCards(input: $input) {unitId front back}} `);
// export const _GetCardsVariables = (event) => {return {input: {gameId: event.params.id, fetch: FLASHCARDS_QUEUE_SIZE, blacklist: []}};};

export const GetCardsQuery = graphql(`
    query GetCards($input: Game_Flashcards_GetCards_Input!) {
        Game_Flashcards_GetCards(input: $input) {
            unitId
            front
            back
        }
    }
`);

export const UpdateCardMutation = graphql(`
    mutation UpdateCard($input: Game_Flashcards_UpdateCard_Input!) {
        Game_Flashcards_UpdateCard(input: $input) {
            unitId
        }
    }
`);

// console.log("UpdateCard_Mutation ", UpdateCard_Mutation);
