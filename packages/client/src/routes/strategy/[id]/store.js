import { writable, get } from "svelte/store";
import { localStorageStore } from "@skeletonlabs/skeleton";
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
        const blacklist = [
            store.active?.data.payload.blacklist,
            ...store.queue?.map((i) => i.data.payload.blacklist)
        ]
            .flat()
            .filter((item) => !!item);

        return blacklist;
    };

    const fetchInstructions = async (take = QUEUE_THRESHOLD) => {
        const blacklist = getBlacklist();
        const input = { take, blacklist, strategyId };
        const response = await Global.post(`/api/instructions`, input);
        // console.log("response /api/instructions", response);
        const { instructions = [], error, status } = response;
        return { instructions, error, status };
    };

    const fillQueue = async () => {
        const { active, queue, status } = get(Store);
        // console.log(`SSTORE queue length: ${queue.length} | fetching: ${queue.length <= QUEUE_THRESHOLD} | has active: ${!!active} `);

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

    return {
        ...Store,
        init: async (params) => {
            strategyId = params.strategyId;
            fetch = params.fetch;
            fillQueue();
        },
        load: () => {
            activate();
            fillQueue();
        },
        next: () => {
            const queueId = get(Store).active?.id;

            activate();
            fillQueue();

            Global.delete(`/api/instructions`, { queueId }).catch((error) =>
                console.error("ERROR /api/instructions DELETE", error)
            );
        }
    };
}

export const instructionStore = createInstructionStore();
export default instructionStore;
