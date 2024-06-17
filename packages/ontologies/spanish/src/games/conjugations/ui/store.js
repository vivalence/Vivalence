import { writable, get } from "svelte/store";
import Global from "$global";

function createConjugationGameStore() {
    const Store = writable({
        instruction: null,
        scope: null,
        inputs: {},
        revealed: false,
        loading: false,
        evaluations: null,
        error: null,
        onFinish: null
    });

    const setInput = (key, userInput) => {
        Store.update((s) => {
            const newUserInputs = { ...s.inputs, [key]: userInput };
            return { ...s, inputs: newUserInputs };
        });
    };

    const reset = () => {
        Store.update((s) => ({
            instruction: null,
            scope: null,
            inputs: {},
            revealed: false,
            loading: false,
            evaluations: null,
            error: null,
            onFinish: null
        }));
    };

    const evaluate = async () => {
        const { instruction, inputs, scope } = get(Store);
        Store.update((s) => ({ ...s, revealed: true, loading: true }));

        try {
            const params = { instruction, inputs, scope };
            const { data: evaluations, error } = Global.post(
                "/api/games/conjugations/evaluate",
                params
            );
            Store.update((s) => ({
                ...s,
                evaluations,
                revealed: true,
                loading: false,
                error
            }));
        } catch (error) {
            console.error("Evaluation error:", error);
            Store.update((s) => ({ ...s, error, loading: false }));
        }
    };

    const finish = () => {
        const store = get(Store);
        if (store.onFinish) {
            store.onFinish();
        }
        reset();
    };

    return {
        ...Store,
        setInput,
        finish,
        evaluate
        // reset
    };
}

const conjugationGameStore = createConjugationGameStore();
export default conjugationGameStore;
