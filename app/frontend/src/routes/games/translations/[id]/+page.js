import { graphql } from "$houdini";

export async function load({ fetch }) {
    let data = {};

    return {
        props: {
            data
        }
    };
}

export const _GetSentenceVariables = (event) => {
    return {
        input: {
            gameId: event.params.id,
            blacklist: event.params.blacklist
        }
    };
};

export const _houdini_load = graphql(`
    query GetSentence($input: Game_Translations_GetSentence_Input!) @cache(policy: NetworkOnly) {
        Game_Translations_GetSentence(input: $input) {
            spoken
            learning
            payload
        }
    }
`);

export const _Evaluate_Mutation = graphql(`
    mutation Review($input: Game_Translations_SentenceTranslation_Input!) {
        Game_Translations_Evaluate(input: $input) {
            gameId
        }
    }
`);
export const _Feedback_Mutation = graphql(`
    mutation Feedback($input: Game_Translations_SentenceTranslation_Input!) {
        Game_Translations_Feedback(input: $input) {
            gameId
            parts {
                part
                correction
                translation
                classification
            }
            correction
            classification
            summary
        }
    }
`);
