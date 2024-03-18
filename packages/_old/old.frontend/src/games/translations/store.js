import { page } from "$app/stores";
import { writable, get } from "svelte/store";
import { browser } from "$app/environment";

import { GetSentenceQuery, EvaluateMutation, FeedbackMutation } from "./gql.js";

function createGameStore() {
    const Store = writable({
        revealed: false,
        loadingFeedback: false,
        gameId: null,
        input: "",
        queue: null,
        sentence: null,
        review: null,
        feedback: null,
        error: null
    });
    const { subscribe, set, update } = Store;

    const fetchSentence = async (gameId) => {
        const blacklist = await makeBlacklist();

        const { data, errors } = await GetSentenceQuery.fetch({
            policy: "NetworkOnly",
            variables: {
                input: { gameId, blacklist }
            }
        });
        const error = errors && errors[0];
        const sentence = !error && data.Game_Translations_GetSentence;
        return { sentence, error };
    };
    const fetchFeedback = async (gameId, sentence, translation) => {
        const mutationInput = {
            input: { gameId, ...sentence, translation }
        };
        const response = await FeedbackMutation.mutate(mutationInput);
        const error = response.errors && response.errors[0];
        const feedback = !error && response.data.Game_Translations_Feedback;
        return { feedback, error };
    };
    const fetchReview = async (gameId, sentence, translation) => {
        const mutationInput = {
            input: { gameId, ...sentence, translation }
        };

        const response = await EvaluateMutation.mutate(mutationInput);
        const error = response.errors && response.errors[0];
        const review = !error && response.data.Game_Translations_Evaluate;
        return { review, error };
    };
    const makeBlacklist = async () => {
        const { sentence, queue } = get(Store);
        const sentences = [sentence, queue].filter((i) => i);
        return sentences
            .map((s) => JSON.parse(s.payload).pos.map((pos) => pos.unit && pos.unit.id))
            .flat()
            .filter((i) => i);
    };
    return {
        subscribe,
        init: async ({ gameId }) => {
            const { sentence, error } = await fetchSentence(gameId);
            update((state) => ({ ...state, gameId, sentence, error }));
        },
        setInput: (input) => update((s) => ({ ...s, input })),
        reveal: (revealed = null) =>
            update((s) => ({ ...s, revealed: revealed === null ? !s.revealed : revealed })),
        displayNextSentence: () => {
            update((s) => ({
                ...s,
                revealed: false,
                feedback: null,
                review: null,
                input: "",
                queue: null,
                sentence: s.queue
            }));
        },
        getSentenceToQueue: async () => {
            const { gameId } = get(Store);

            const { sentence, error } = await fetchSentence(gameId);
            if (error) {
                console.error("ERROR", error);
                update((s) => ({ ...s, error }));
            } else {
                update((s) => ({ ...s, queue: sentence }));
            }
        },
        getReview: async () => {
            const { gameId, sentence, input } = get(Store);
            const { review, error } = await fetchReview(gameId, sentence, input);
            if (error) {
                console.error("ERROR", error);
                update((s) => ({ ...s, error }));
            } else {
                update((s) => ({ ...s, review }));
            }
        },
        getFeedback: async () => {
            update((s) => ({ ...s, loadingFeedback: true }));
            const { gameId, sentence, input } = get(Store);
            const { feedback, error } = await fetchFeedback(gameId, sentence, input);
            if (error) {
                console.error("ERROR", error);
                update((s) => ({ ...s, error, loadingFeedback: false }));
            } else {
                feedback.sentence = sentence;
                update((s) => ({ ...s, feedback, loadingFeedback: false }));
            }
        }
    };
}

export const gameStore = createGameStore();
export default gameStore;
