import { writable, get } from "svelte/store";
import Global from "$global";

function createFlashcardStore() {
    const Store = writable({
        loading: true,
        revealed: false,
        payload: null,
        instruction: null,
        onFinish: null
    });

    return {
        ...Store,
        reveal: () => {
            Store.update((store) => ({ ...store, revealed: true }));
        },
        review: async (response) => {
            const { payload, onFinish } = get(Store);

            onFinish({ response, payload });

            Global.post("/api/games/flashcards/evaluate", {
                unitId: payload.unitId,
                gameId: payload.gameId,
                response
            })
                // .then((response) => {console.log("RESPONSE /api/games/flashcards/review POST", response);})
                .catch((error) => {
                    console.error("ERROR /api/games/flashcards/review POST", error);
                });
        }
    };
}

export const store = createFlashcardStore();
export default store;
