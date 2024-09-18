import { get, writable } from "svelte/store";
import { fromScope } from "$lib/blacklist.js";
import { env } from "$env/dynamic/public";

const QUEUE_THRESHOLD = parseInt(env["PUBLIC_QUEUE_THRESHOLD"]);

function InstructionStore({ locals, strategy }) {
  const Store = writable({
    active: null,
    queue: [],
    status: null,
    error: null,
  });

  const getBlacklist = () => {
    const store = get(Store);
    let blacklist = { units: [], tags: [], instructions: [] };

    const scopes = [];
    [store.active, ...store.queue]
      .filter((x) => x)
      .forEach((item) => {
        scopes.push(item.data.scope);
        blacklist.instructions.push(item.id);
      });

    scopes.map((scope) => {
      blacklist = fromScope({ blacklist, scope });
    });
    return blacklist;
  };

  const fetchInstructions = async (take = QUEUE_THRESHOLD) => {
    const blacklist = getBlacklist();

    const input = {
      take,
      blacklist,
      scope: {
        tactic: { id: strategy.session[0].tactic.id },
        strategy: { id: strategy.id },
      },
    };

    const response = await locals.call(`/instructions/get`, input);

    if (response.error || response.data.error)
      return { error: response.error || response.data.error, status: 500 };

    const { instructions = [], error, status } = response.data;
    return { instructions, error, status };
  };

  const fillQueue = async () => {
    const { active, queue, status } = get(Store);

    if (queue.length <= QUEUE_THRESHOLD) {
      Store.update((s) => ({ ...s, status: 202 }));
      const { instructions, ...result } = await fetchInstructions();
      Store.update((store) => {
        const queue = [...store.queue, ...instructions];
        const active = store.active || queue.shift();
        return { ...store, active, queue, ...result };
      });
    }
  };
  const activate = () => {
    Store.update((store) => {
      const active = store.queue[0];
      const queue = store.queue.slice(1);
      return { ...store, active, queue };
    });
  };
  const reset = () => {
    Store.update((store) => {
      return {
        active: null,
        queue: [],
        status: null,
        error: null,
      };
    });
  };
  const load = () => {
    activate();
    fillQueue();
  };
  const next = async () => {
    const queueId = get(Store).active?.id;
    activate();
    await locals.call(`/instructions/delete`, { queueId });
    fillQueue();
  };

  return {
    ...Store,
    strategy: { id: strategy.id },
    reset,
    load,
    next,
  };
}

let store;

export function createStore(input) {
  if (!store) store = InstructionStore(input);
  else if (input.strategy.id !== store.strategy.id) {
    store.reset();
    store = InstructionStore(input);
  }

  return store;
}

export function getStore() {
  return store;
}

// export const instructionStore = createInstructionStore();
// export default instructionStore;
