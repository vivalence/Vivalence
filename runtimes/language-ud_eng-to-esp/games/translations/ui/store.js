import { get, writable } from "svelte/store";

function GameStore({ locals }) {
  const Store = writable({
    instruction: null,
    scope: null,
    input: "",
    revealed: false,
    loading: false,
    evaluation: null,
  });

  const evaluate = async () => {
    Store.update((s) => ({ ...s, loading: true }));
    const { scope, instruction, input } = get(Store);
    const params = {
      sentence: {
        ...instruction.sentence,
        translation: input,
      },
      scope,
    };
    const evaluation = await locals.ontology("games/translations/evaluate", params).ok();
    Store.update((s) => ({ ...s, evaluation, loading: false }));
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
    }));
  };
  return {
    ...Store,
    setInput: (input) => Store.update((s) => ({ ...s, input })),
    setLoading: (loading) => Store.update((store) => ({ ...store, loading })),
    evaluate,
    commitTranslation: async () => {
      Store.update((s) => ({ ...s, revealed: true }));
      evaluate();
    },
    finishTranslation: () => {
      locals.onGameFinish();
      reset();
    },
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
