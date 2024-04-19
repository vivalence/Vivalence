import { writable, get } from "svelte/store";
import Global from "$global";

function createConjugationGameStore() {
    const Store = writable({
        instruction: null,
        payload: null,
        inputs: {},
        revealed: false,
        loading: false,
        evaluations: null,
        error: null,
        onFinish: null
    });

    const setInput = (person, userInput) => {
        Store.update((s) => {
            const newUserInputs = { ...s.inputs, [person]: userInput };
            return { ...s, inputs: newUserInputs };
        });
    };

    const reset = () => {
        Store.update((s) => ({
            instruction: null,
            payload: null,
            inputs: {},
            revealed: false,
            loading: false,
            evaluations: null,
            error: null,
            onFinish: null
        }));
    };

    const evaluate = async () => {
        const storeValue = get(Store);
        const { instruction, inputs, payload } = storeValue;
        Store.update((s) => ({ ...s, revealed: true, loading: true }));

        try {
            const params = { instruction, inputs, payload };
            const { data: evaluations, error } = Global.post(
                "/api/games/conjugations/evaluate",
                params
            );
            console.log("evaluationResults ", evaluations);
            Store.update((s) => ({
                ...s,
                evaluations,
                revealed: true,
                loading: false,
                error: null
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
