import { graphql } from "$houdini";

export const GetSentenceQuery = graphql(`
    query GetSentence($input: Game_Translations_GetSentence_Input!) @cache(policy: NetworkOnly) {
        Game_Translations_GetSentence(input: $input) {
            spoken
            learning
            payload
        }
    }
`);

export const EvaluateMutation = graphql(`
    mutation Review($input: Game_Translations_SentenceTranslation_Input!) {
        Game_Translations_Evaluate(input: $input) {
            gameId
        }
    }
`);
export const FeedbackMutation = graphql(`
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
