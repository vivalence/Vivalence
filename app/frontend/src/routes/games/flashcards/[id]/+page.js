import { graphql } from "$houdini";

import { FLASHCARDS_QUEUE_SIZE } from "./settings.js";

export const _GetCardsVariables = (event) => {
    return {
        input: {
            gameId: event.params.id,
            fetch: FLASHCARDS_QUEUE_SIZE,
            blacklist: []
        }
    };
};

export const _houdini_load = graphql(`
    query GetCards($input: Game_Flashcards_GetCards_Input!) {
        Game_Flashcards_GetCards(input: $input) {
            unitId
            front
            back
        }
    }
`);
