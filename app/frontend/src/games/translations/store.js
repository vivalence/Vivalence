import { writable, get } from "svelte/store";
import Global from "$global";

function createGameStore() {
    const Store = writable({
        payload: null,
        instructions: null,
        input: "",
        revealed: false,
        loading: false,
        feedback: null,
        onFinish: null
    });

    return {
        ...Store,
        setInput: (input) => Store.update((s) => ({ ...s, input })),
        setLoading: (loading) => Store.update((store) => ({ ...store, loading })),
        setRevealed: (revealed) => Store.update((store) => ({ ...store, revealed })),
        evaluate: async () => {
            const { payload, instructions, input } = get(Store);
            const params = {
                gameId: payload.gameId,
                sentence: {
                    spoken: instructions.spoken,
                    learning: instructions.learning,
                    translation: input
                },
                payload
            };
            const response = await Global.post("/api/games/translations/evaluate", params);
            // TODO: @once quality is reliable
            // itterate through responses & set background color as success, warning or failure
        },
        feedback: async () => {
            const { instructions, input } = get(Store);
            const params = {
                sentence: {
                    spoken: instructions.spoken,
                    learning: instructions.learning,
                    translation: input
                }
            };

            const { data: feedback, ...response } = await Global.post(
                "/api/games/translations/feedback",
                params
            );
            Store.update((s) => ({ ...s, ...response, feedback }));
        }
    };
}

const gameStore = createGameStore();
export default gameStore;
