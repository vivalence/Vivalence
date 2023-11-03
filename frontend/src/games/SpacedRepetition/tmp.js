import { writable } from "svelte/store";

// i need a store for the node being reviewed, state for revealed
// and review functionality that calls a mutation
// the data is probably getting passed into the store from the path

function createReviewedState() {
    const { subscribe, set, update } = writable(false);
    let reviewed = subscribe;
    console.log("store stater reviewer", reviewed);

    return {
        subscribe,
        toggle: () => update((n) => !n),
        reset: () => set(false)
    };
}

// maybe implement this as a readble
export const createDataStore = (word) => {
    const { subscribe, set, update } = writable(word);

    return {
        subscribe,
        set: (n) => set(n)
        // reset: () => set(false)
    };
};

export const reviewed = createReviewedState();
