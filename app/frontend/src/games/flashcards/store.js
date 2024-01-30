import { writable, get } from "svelte/store";
import { FLASHCARDS_QUEUE_SIZE } from "./library.js";
import { UpdateCardMutation, GetCardsQuery } from "./gql.js";

function createFlashcardStore() {
    const Store = writable({
        flashcards: [],
        gameId: null,
        current: null,
        revealed: false,
        loading: false,
        error: null
    });

    const getIds = () => {
        let ids;
        Store.update((store) => {
            ids = [store.current?.unitId, ...store.flashcards.map((item) => item.unitId)];
            return store;
        });
        return ids.filter((id) => !!id);
    };
    const addCards = (cards) => {
        Store.update((store) => ({
            ...store,
            flashcards: [...store.flashcards, ...cards]
        }));
    };
    const nextCard = () => {
        Store.update((store) => {
            const current = store.flashcards.shift();
            return {
                ...store,
                current
            };
        });
    };
    const fetchCards = async ({ gameId }) => {
        const blacklist = getIds();

        const queryResult = await GetCardsQuery.fetch({
            policy: "NetworkOnly",
            variables: {
                input: {
                    gameId,
                    fetch: FLASHCARDS_QUEUE_SIZE - (blacklist.length - 1),
                    blacklist
                }
            }
        });

        return { cards: queryResult.data.Game_Flashcards_GetCards, errors: queryResult.errors };
    };

    return {
        subscribe: Store.subscribe,
        init: async ({ gameId }) => {
            const { cards, errors } = await fetchCards({ gameId });
            const [current, ...flashcards] = cards;
            Store.set({
                flashcards,
                gameId,
                current,
                revealed: false,
                loading: false,
                error: errors
            });
        },
        reveal: () => {
            Store.update((store) => ({ ...store, revealed: true }));
        },
        review: async (response) => {
            Store.update((store) => ({ ...store, loading: true, revealed: false }));
            const { gameId, current } = get(Store);

            nextCard(); // Must be called after fetching store state; because current changes. @lj

            const [queryResult, mutationResult] = await Promise.all([
                fetchCards({ gameId }),
                UpdateCardMutation.mutate({
                    input: {
                        gameId,
                        response,
                        unitId: current.unitId
                    }
                })
            ]);

            // console.log("results data", queryResult, mutationResult);

            const errors = queryResult.errors || mutationResult.errors;
            if (errors) {
                console.error("ERROR", errors);
                Store.update((store) => ({
                    ...store,
                    error: { errors: errors, current },
                    loading: false
                }));
            } else {
                addCards(queryResult.cards);
                Store.update((store) => {
                    const current = store.current || store.flashcards.shift();
                    return { ...store, loading: false, error: null };
                });
            }
        }
    };
}

export const flashcardsStore = createFlashcardStore();
export default flashcardsStore;
