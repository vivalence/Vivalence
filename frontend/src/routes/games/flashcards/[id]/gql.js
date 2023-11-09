import { graphql } from "$houdini";

export const FlashcardsLoopMutation = graphql(`
    mutation FlashcardsLoop(
        $gameUnitRelationInput: FlashcardsGameUnitRelationInput!
        $gamePlayStateInput: FlashcardsGamePlayStateInput!
    ) {
        flashcardsLoop(
            gamePlayStateInput: $gamePlayStateInput
            gameUnitRelationInput: $gameUnitRelationInput
        ) {
            gamePlayStateUpdate {
                gameId
                newCards {
                    unitId
                    front
                    back
                }
            }
            gameUnitRelationUpdate {
                gameUnitRelation {
                    id
                    nextPlay
                }
            }
        }
    }
`);
