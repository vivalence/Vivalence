import { writable, get } from "svelte/store";
import { FLASHCARDS_QUEUE_SIZE } from "./settings.js";
import { UpdateCard_Mutation } from "./gql.js";
import { GetCardsStore } from "$houdini";

function createFlashcardStore() {
    const Store = writable({
        flashcards: [],
        gameId: null,
        current: null,
        revealed: false,
        loading: false,
        error: null
    });
    const GetCardsQuery = new GetCardsStore();

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

    return {
        subscribe: Store.subscribe,
        init: ({ cards, gameId }) => {
            const [current, ...flashcards] = cards;
            Store.set({
                flashcards,
                gameId,
                current,
                revealed: false,
                loading: false,
                error: null
            });
        },
        reveal: () => {
            Store.update((store) => ({ ...store, revealed: true }));
        },
        review: async (response) => {
            Store.update((store) => ({ ...store, loading: true, revealed: false }));
            const blacklist = getIds();
            const gameId = get(Store).gameId;
            const current = get(Store).current;

            nextCard(); // Must be called after fetching store state. @lj

            const [queryResult, mutationResult] = await Promise.all([
                GetCardsQuery.fetch({
                    policy: "NetworkOnly",
                    variables: {
                        input: {
                            gameId,
                            fetch: FLASHCARDS_QUEUE_SIZE - (blacklist.length - 1),
                            blacklist
                        }
                    }
                }),
                UpdateCard_Mutation.mutate({
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
                addCards(queryResult.data.Game_Flashcards_GetCards);
                Store.update((store) => {
                    const current = store.current || store.flashcards.shift();
                    return { ...store, loading: false, error: null };
                });
            }
        }
    };
}

export const flashcardsStore = createFlashcardStore();
