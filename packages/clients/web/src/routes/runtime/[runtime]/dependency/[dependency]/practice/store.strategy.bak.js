//  store.session = [
//      {
//      "for": {"type": "repetitions", "value": 10},
//      "tactic": {"id": "2bdcd051-e075-412e-9959-f67bd4f56fbb", "slug": "article-morphology-gender-and-number", "name": "Morphology of Articles with gender and number", "description": "Learn how to properly use gender and number of vocabulary by repetition of flashcards."},
//      "active": true,
//      "progress": 0
//      },
//      {
//      "for": {"type": "repetitions", "value": 10},
//      "tactic": {"id": "649484a9-4659-4ea3-a57b-7404a59a69e7", "slug": "applying-verb-conjugations", "name": "Verb Conjugation", "description": "Conjugate a set of verbs for a given tense and mood. Supported by flashcards and a translation."},
//      "active": false,
//      "progress": 0
//      }
// ]
import { get, writable } from "svelte/store";
import { fromScope } from "$lib/blacklist.js";
import { env } from "$env/dynamic/public";

const QUEUE_THRESHOLD = parseInt(env["PUBLIC_QUEUE_THRESHOLD"]);

const buildSession = (session) => {
  return session.map((session, i) => ({
    ...session,
    active: i === 0 ? true : false,
    progress: 0,
  }));
};

function InstructionStore({ locals, strategy }) {
  const Store = writable({
    session: buildSession(strategy.session),
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
        if (item.data.type !== "SIGNAL") scopes.push(item.data.scope);
        blacklist.instructions.push(item.id);
      });

    scopes.map((scope) => {
      blacklist = fromScope({ blacklist, scope });
    });
    return blacklist;
  };

  const fetchInstructions = async (take = QUEUE_THRESHOLD) => {
    const blacklist = getBlacklist();
    const { session } = get(Store);

    const input = {
      take,
      blacklist,
      scope: {
        tactic: { id: session.find((s) => s.active).tactic.id },
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
        session: buildSession(strategy.session),
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

  const incrementSession = () => {
    Store.update((store) => {
      const activeIndex = store.session.findIndex((s) => s.active);
      if (activeIndex === -1) throw new Error("No active session found");

      const session = [...store.session];
      const active = session[activeIndex];
      const newProgress = active.progress + 1;

      if (newProgress >= active.for.value) {
        session[activeIndex] = { ...active, active: false, progress: newProgress };
        const nextIndex = activeIndex + 1;
        if (session[nextIndex]) session[nextIndex] = { ...session[nextIndex], active: true };
        else throw new Error("Sessions exhausted");
      } else {
        session[activeIndex] = { ...active, progress: newProgress };
      }

      return { ...store, session };
    });
  };

  return { ...Store, strategy, reset, load, next, incrementSession };
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

export default store;

// export const instructionStore = createInstructionStore();
// export default instructionStore;
