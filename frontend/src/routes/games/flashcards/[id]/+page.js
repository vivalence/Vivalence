import { FLASHCARDS_QUEUE_SIZE } from "./settings.js";

export const _FlashcardsInitVariables = (event) => ({
    gamePlayStateInput: {
        gameId: event.params.id,
        fetch: FLASHCARDS_QUEUE_SIZE,
        blacklist: []
    }
});

// this returns the initial set of game cards.
// the amount of cards in the cue is determined by some variable.
// it also fetches the game mask thats used to shape the data onto the DOM

export const _houdini_load = graphql(`
    query FlashcardsInit($gamePlayStateInput: FlashcardsGamePlayStateInput!) {
        flashcardsInit(gamePlayStateInput: $gamePlayStateInput) {
            gamePlayStateUpdate {
                gameId
                newCards {
                    unitId
                    front
                    back
                }
            }
        }
    }
`);
