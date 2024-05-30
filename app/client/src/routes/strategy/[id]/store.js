import { writable, get } from "svelte/store";
import { localStorageStore } from "@skeletonlabs/skeleton";
import scopeToBlacklist from "$lib/scopeToBlacklist";
import Global from "$global";

const QUEUE_THRESHOLD = 3;

function createInstructionStore() {
    let strategyId = null;
    let fetch = null;

    const Store = localStorageStore("instructions", {
        active: null,
        queue: [],
        status: null,
        error: null,
        onFinish: null
    });

    const getBlacklist = () => {
        const store = get(Store);
        let blacklist = {
            units: [],
            tags: [],
            instructions: []
        };
        const scopes = [];
        [store.active, ...store.queue]
            .filter((x) => x)
            .forEach((item) => {
                scopes.push(item.data.scope);
                blacklist.instructions.push(item.id);
            });

        scopes.map((scope) => {
            blacklist = scopeToBlacklist({ blacklist, scope });
        });
        return blacklist;
    };

    const fetchInstructions = async (take = QUEUE_THRESHOLD) => {
        const blacklist = getBlacklist();
        const input = { take, blacklist, strategyId };
        let response;
        for (let i = 0; i < 3; i++) {
            response = await Global.post(`/api/instructions`, input);
            if (response.error === 500) await new Promise((resolve) => setTimeout(resolve, 500));
            else break;
        }

        const { instructions = [], error, status } = response;
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
                onFinish: null
            };
        });
    };

    const init = async (params) => {
        fetch = params.fetch;
        if (params.strategyId !== strategyId) reset();
        strategyId = params.strategyId;
        fillQueue();
    };

    return {
        ...Store,
        init,
        load: () => {
            activate();
            fillQueue();
        },
        next: async () => {
            const queueId = get(Store).active?.id;
            activate();
            await Global.delete(`/api/instructions`, { queueId });
            fillQueue();
        }
    };
}

export const instructionStore = createInstructionStore();
export default instructionStore;
