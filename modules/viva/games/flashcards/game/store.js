import { get, writable } from "svelte/store";

function FlashcardStore({ locals }) {
  const Store = writable({
    loading: true,
    revealed: false,
    scope: null,
    instruction: null,
  });

  return {
    ...Store,
    reveal: () => {
      Store.update((store) => ({ ...store, revealed: true }));
    },
    review: async (response) => {
      const { scope } = get(Store);
      locals.onGameFinish({ response, scope });
      await locals.call("/g/flashcards/evaluate", { scope, response });
    },
  };
}

let store;

export function createStore(input) {
  if (!store) store = FlashcardStore(input);
  return store;
}

export function getStore(input) {
  return store;
}
