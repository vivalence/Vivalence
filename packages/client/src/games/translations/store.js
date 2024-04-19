import { writable, get } from "svelte/store";
import Global from "$global";

function createGameStore() {
    const Store = writable({
        payload: null,
        instruction: null,
        input: "",
        revealed: false,
        loading: false,
        feedback: null,
        evaluation: null,
        onFinish: null
    });

    const evaluate = async () => {
        const { payload, instruction, input } = get(Store);
        const params = {
            gameId: payload.gameId,
            sentence: {
                spoken: instruction.spoken,
                learning: instruction.learning,
                translation: input
            },
            payload
        };
        const { error, data: evaluation } = await Global.post(
            "/api/games/translations/evaluate",
            params
        );
        Store.update((s) => ({ ...s, evaluation }));
        // TODO: @once evaluation quality is reliable
        // itterate through responses & set background color as success, warning or failure
    };
    const feedback = async () => {
        const { instruction, input } = get(Store);
        const params = {
            sentence: {
                spoken: instruction.spoken,
                learning: instruction.learning,
                translation: input
            }
        };

        const { data: feedback, ...response } = await Global.post(
            "/api/games/translations/feedback",
            params
        );
        Store.update((s) => ({ ...s, ...response, feedback }));
    };
    const reset = () => {
        Store.update((s) => ({
            payload: null,
            instruction: null,
            input: "",
            revealed: false,
            loading: false,
            feedback: null,
            evaluation: null,
            onFinish: null
        }));
    };
    return {
        ...Store,
        setInput: (input) => Store.update((s) => ({ ...s, input })),
        setLoading: (loading) => Store.update((store) => ({ ...store, loading })),
        feedback,
        commitTranslation: async () => {
            Store.update((s) => ({ ...s, revealed: true }));
            evaluate();
        },
        finishTranslation: async () => {
            get(Store).onFinish();
            reset();
        }
    };
}

const gameStore = createGameStore();
export default gameStore;
