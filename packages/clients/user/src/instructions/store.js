import { get, writable } from "svelte/store";
import { fromScope } from "$lib/blacklist.js";
import { env } from "$env/dynamic/public";

const QUEUE_THRESHOLD = parseInt(env["PUBLIC_QUEUE_THRESHOLD"]);

function InstructionStore({ pull, done }) {
  const Store = writable({
    active: null,
    queue: [],
    status: null,
    error: null,
  });

  const pullInstructions = async () => {
    const { active, queue, status } = get(Store);
    if (queue.length >= QUEUE_THRESHOLD) return;
    Store.update((s) => ({ ...s, status: 202 }));

    try {
      const blacklist = buildBlacklist([active, ...queue]);
      const instructions = await pull({ take: QUEUE_THRESHOLD, blacklist });

      Store.update((store) => {
        const queue = [...store.queue, ...instructions];
        const active = store.active || queue.shift();
        return { ...store, active, queue, status: 200, error: null };
      });
    } catch (error) {
      console.error("Error pulling instructions");
      console.error(error);
      Store.update((store) => ({ ...store, error, status: error.status || 500 }));
    }
  };

  const queueToActive = () => {
    Store.update((store) => ({
      ...store,
      active: store.queue[0],
      queue: store.queue.slice(1),
    }));
  };

  const reset = () => {
    Store.update((store) => ({
      active: null,
      queue: [],
      status: null,
      error: null,
    }));
  };

  const next = async () => {
    const instruction = get(Store).active;
    queueToActive();
    await done(instruction);
    pullInstructions();
  };

  const load = () => {
    queueToActive();
    pullInstructions();
  };

  return { ...Store, reset, next, load };
}

const buildBlacklist = (instructions) => {
  let blacklist = { units: [], tags: [] };

  instructions
    .filter((x) => x)
    .forEach((item) => {
      if (item.type === "SIGNAL") return;
      blacklist = fromScope({ blacklist, scope: item.scope });
    });
  // .reduce((scopes, item) => {if (item.type !== "SIGNAL") scopes.push(item.scope); return scopes;}, [])
  // .map((scope) => {blacklist = fromScope({ blacklist, scope });});

  return blacklist;
};

let store;

export function createStore(input) {
  if (!store) store = InstructionStore(input);
  return store;
}

export function getStore() {
  return store;
}

export default store;
