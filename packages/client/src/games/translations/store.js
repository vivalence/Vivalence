import { writable, get } from "svelte/store";
import Global from "$global";

function createGameStore() {
    const Store = writable({
        instruction: null,
        scope: null,
        input: "",
        revealed: false,
        loading: false,
        feedback: null,
        evaluation: null,
        onFinish: null
    });

    const evaluate = async () => {
        const { scope, instruction, input } = get(Store);
        const params = {
            sentence: {
                ...instruction.sentence,
                translation: input
            },
            scope
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
            scope,
            sentence: {
                ...instruction.sentence,
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
            instruction: null,
            scope: null,
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
