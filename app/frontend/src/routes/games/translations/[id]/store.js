import { page } from "$app/stores";
import { writable, get } from "svelte/store";
import { browser } from "$app/environment";
import { _GetSentenceVariables, _Evaluate_Mutation, _Feedback_Mutation } from "./+page.js";
import { cache, GetSentenceStore } from "$houdini";

const sentenceStore = new GetSentenceStore();

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
        const variables = _GetSentenceVariables({ params: { id: gameId, blacklist } });
        const { data, errors } = await sentenceStore.fetch({ variables });
        const error = errors && errors[0];
        const sentence = !error && data.Game_Translations_GetSentence;
        return { sentence, error };
    };
    const fetchFeedback = async (gameId, sentence, translation) => {
        const mutationInput = {
            input: { gameId, ...sentence, translation }
        };
        const response = await _Feedback_Mutation.mutate(mutationInput);
        const error = response.errors && response.errors[0];
        const feedback = !error && response.data.Game_Translations_Feedback;
        return { feedback, error };
    };
    const fetchReview = async (gameId, sentence, translation) => {
        const mutationInput = {
            input: { gameId, ...sentence, translation }
        };

        const response = await _Evaluate_Mutation.mutate(mutationInput);
        const error = response.errors && response.errors[0];
        const review = !error && response.data.Game_Translations_Evaluate;
        return { review, error };
    };
    const makeBlacklist = async () => {
        const { sentence, queue } = get(Store);
        return [sentence, queue]
            .filter((i) => i)
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

// import { writable, get } from "svelte/store";
// import { FLASHCARDS_QUEUE_SIZE } from "./settings.js";
// import { UpdateCard_Mutation } from "./gql.js";
// import { GetCardsStore } from "$houdini";

// function createFlashcardStore() {
//     const Store = writable({
//         flashcards: [],
//         gameId: null,
//         current: null,
//         revealed: false,
//         loading: false,
//         error: null
//     });
//     const GetCardsQuery = new GetCardsStore();

//     const getIds = () => {
//         let ids;
//         Store.update((store) => {
//             ids = [store.current?.unitId, ...store.flashcards.map((item) => item.unitId)];
//             return store;
//         });
//         return ids.filter((id) => !!id);
//     };
//     const addCards = (cards) => {
//         Store.update((store) => ({
//             ...store,
//             flashcards: [...store.flashcards, ...cards]
//         }));
//     };
//     const nextCard = () => {
//         Store.update((store) => {
//             const current = store.flashcards.shift();
//             return {
//                 ...store,
//                 current
//             };
//         });
//     };

//     return {
//         subscribe: Store.subscribe,
//         init: ({ cards, gameId }) => {
//             const [current, ...flashcards] = cards;
//             Store.set({
//                 flashcards,
//                 gameId,
//                 current,
//                 revealed: false,
//                 loading: false,
//                 error: null
//             });
//         },
//         reveal: () => {
//             Store.update((store) => ({ ...store, revealed: true }));
//         },
//         review: async (response) => {
//             Store.update((store) => ({ ...store, loading: true, revealed: false }));
//             const blacklist = getIds();
//             const gameId = get(Store).gameId;
//             const current = get(Store).current;

//             nextCard(); // Must be called after fetching store state. @lj

//             const [queryResult, mutationResult] = await Promise.all([
//                 GetCardsQuery.fetch({
//                     policy: "NetworkOnly",
//                     variables: {
//                         input: {
//                             gameId,
//                             fetch: FLASHCARDS_QUEUE_SIZE - (blacklist.length - 1),
//                             blacklist
//                         }
//                     }
//                 }),
//                 UpdateCard_Mutation.mutate({
//                     input: {
//                         gameId,
//                         response,
//                         unitId: current.unitId
//                     }
//                 })
//             ]);

//             // console.log("results data", queryResult, mutationResult);

//             const errors = queryResult.errors || mutationResult.errors;
//             if (errors) {
//                 console.error("ERROR", errors);
//                 Store.update((store) => ({
//                     ...store,
//                     error: { errors: errors, current },
//                     loading: false
//                 }));
//             } else {
//                 addCards(queryResult.data.Game_Flashcards_GetCards);
//                 Store.update((store) => {
//                     const current = store.current || store.flashcards.shift();
//                     return { ...store, loading: false, error: null };
//                 });
//             }
//         }
//     };
// }

// export const flashcardsStore = createFlashcardStore();
