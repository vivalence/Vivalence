import { graphql } from "$houdini";

export const _GetSentenceVariables = (event) => {
    return {
        input: {
            gameId: event.params.id
        }
    };
};

export const _houdini_load = graphql(`
    query GetSentence($input: Game_Translations_GetSentence_Input!) {
        Game_Translations_GetSentence(input: $input) {
            spoken
            learning
        }
    }
`);

export const _ReviewSentence_Mutation = graphql(`
    mutation ReviewSentence($input: Game_Translations_ReviewSentence_Input!) {
        Game_Translations_ReviewSentence(input: $input) {
            gameId
        }
    }
`);
