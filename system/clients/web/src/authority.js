import { env } from "$env/dynamic/public";
import { get } from "svelte/store";
import { persisted } from "svelte-persisted-store";

import { Service, Runtime } from "./prototypes/index.js";
import { Call } from "./prototypes/call/index.js";
import { Authority } from "./prototypes/authority/index.js";

export const lighthouse = new Service(env["PUBLIC_VIVA_LIGHTHOUSE_URL"]);
export const authority = new Authority(lighthouse);
export const auth = authority.store;
export const services = [];

export const runtimes = persisted("runtimes", [], {
  beforeRead: (shards) => {
    return shards.map((s) => new Runtime(s));
  },
  beforeWrite: (runtimes) => {
    const urls = new Set();
    return runtimes
      .filter((runtime) => {
        if (urls.has(runtime.shard.url)) return false;
        urls.add(runtime.shard.url);
        return true;
      })
      .map((runtime) => runtime.shard);
  },
});

authority.store.identity.subscribe((identity) =>
  identity.shards.map((shard) => {
    if (!get(runtimes).find((runtime) => runtime.shard.url === shard.url)) {
      runtimes.update((runtimes) => {
        runtimes.push(new Runtime(shard));
        return runtimes;
      });
    }
  }),
);
