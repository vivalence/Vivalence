import { get, writable } from "svelte/store";

function ConjugationGameStore({ locals }) {
  const Store = writable({
    instruction: null,
    scope: null,
    inputs: {},
    revealed: false,
    loading: false,
    evaluations: null,
    error: null,
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
    }));
  };

  const evaluate = async () => {
    const { instruction, inputs, scope } = get(Store);
    Store.update((s) => ({ ...s, revealed: true, loading: true }));

    try {
      const params = { instruction, inputs, scope };
      const evaluations = await locals.ontology("games/conjugations/evaluate", params).ok();
      Store.update((s) => ({
        ...s,
        evaluations,
        revealed: true,
        loading: false,
      }));
    } catch (error) {
      console.error("Evaluation error:", error);
      Store.update((s) => ({ ...s, error, loading: false }));
    }
  };

  const finish = () => {
    locals.onGameFinish();
    reset();
  };

  return {
    ...Store,
    setInput,
    finish,
    evaluate,
  };
}

let store;

export function createStore(input) {
  if (!store) store = ConjugationGameStore(input);
  return store;
}

export function getStore(input) {
  return store;
}
