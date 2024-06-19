import { writable, get } from "svelte/store";

function GameStore({ locals }) {
    const Store = writable({
        instruction: null,
        scope: null,
        input: "",
        revealed: false,
        loading: false,
        feedback: null,
        evaluation: null
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
        const evaluation = await locals.ontology("games/translations/evaluate", params).ok();
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

        const feedback = await locals.ontology("games/translations/feedback", params).ok();
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
            evaluation: null
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
        finishTranslation: () => {
            locals.onGameFinish();
            reset();
        }
    };
}

let store;

export function createStore(input) {
    if (!store) store = GameStore(input);
    return store;
}

export function getStore(input) {
    return store;
}
