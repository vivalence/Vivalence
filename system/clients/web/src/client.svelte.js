import { env } from "$env/dynamic/public";
import { SvelteSet, SvelteMap } from "svelte/reactivity";
import { get, derived } from "svelte/store";
// import { persistedState } from "svelte-persisted-state"; // cant subscribe
import { persisted } from "svelte-persisted-store";

import { createRuntime } from "./prototypes/runtime.svelte.js";
import { createService } from "./prototypes/service.svelte.js";

export const identity = persisted("identity", null); // {id, slug}
export const authority = persisted("authority", null); // {access, refresh}

// export const isIdentified = derived(identity, ($identity) => !!$identity);
export const isIdentified = () => !!identity;

export const lighthouse = createService(env["PUBLIC_VIVA_LIGHTHOUSE_URL"]);
lighthouse.handshake();

export const runtimes = new SvelteMap();
export const services = new SvelteSet([lighthouse]);

identity.subscribe((identity) => {
  identity?.shards?.forEach(async (shard) => {
    shard.authority = derived(authority, (a) => a);
    if (!runtimes.has(shard.url)) runtimes.set(shard.url, createRuntime(shard));
  });
});

export const login = async (username, password) => {
  const result = await lighthouse.call("/auth/login", { username, password });
  if (result.authority) authority.set(result.authority);
  if (result.identity) identity.set(result.identity);
  return result;
};

export const verify = async () => {
  const auth = get(authority);
  if (!auth?.access) return { valid: false };

  const result = await lighthouse.call("/auth/verify", { access: auth.access });
  return result;
};

export const refresh = async () => {
  const auth = get(authority);
  if (!auth?.refresh) return { valid: false };

  const result = await lighthouse.call("/auth/refresh", {
    refresh: auth.refresh,
  });

  if (result.access) {
    authority.update((auth) => ({ ...auth, access: result.access }));
    return { valid: true };
  }

  return { valid: false };
};

export const logout = async () => {
  const auth = get(authority);
  if (auth?.refresh) {
    lighthouse.call("/auth/logout", { refresh: auth.refresh });
  }
  authority.set(null);
  identity.set(null);
};

// import { Service, Runtime } from "./prototypes/index.js";
// import { Call } from "./prototypes/call/index.js";
// import { Authority } from "./prototypes/authority/index.js";
// export const lighthouse = new Service(env["PUBLIC_VIVA_LIGHTHOUSE_URL"]);
// export const authority = new Authority(lighthouse);
// export const auth = authority.store;

// export const runtimes = persisted("runtimes", [], {
//   beforeRead: (shards) => {
// return shards.map((s) => new Runtime(s)); //
//   },
//   beforeWrite: (runtimes) => {
//     const urls = new Set();
//     return runtimes
//       .filter((runtime) => {
//         if (urls.has(runtime.shard.url)) return false;
//         urls.add(runtime.shard.url);
//         return true;
//       })
//       .map((runtime) => runtime.shard);
//   },
// });

// authority.store.identity.subscribe((identity) =>
//   identity.shards.map((shard) => {
//     if (!get(runtimes).find((runtime) => runtime.shard.url === shard.url)) {
//       runtimes.update((runtimes) => {
//         runtimes.push(new Runtime(shard));
//         return runtimes;
//       });
//     }
//   }),
// );

// old ideation
// const discoverRuntimes = async (lighthouse, authority) => {
//   const runtimes = new Map();

//   const shards = await lighthouse.repository("shard").findMany();

//   for (const shard of shards) {
//     if (!runtimes.has(shard.slug)) {
//       const runtime = new Runtime(shard, authority);
//       await runtime.handshake();
//       runtimes.set(shard.slug, runtime);
//       console.log(`Runtime ${shard.slug} connected:`, runtime.status);
//     }
//   }

//   return runtimes;
// };
// other ideation
// export const auth = writable(null);
// export const isAuthenticated = derived(auth, $auth => !!$auth?.token);
// export const dataManager = derived(
//   [auth, isAuthenticated],
//   ([$auth, $isAuth], set) => {
//     if ($isAuth) {
//       const resolver = new DataResolver($auth);
//       resolver.autoResolve().then(set);
//     }
//   }
// );
// // data-resolver.svelte.js
// export function createDataResolver(authStore) {
//   let resolvedData = $state({});
//   let isLoading = $state(false);

//   $effect(() => {
//     if (authStore.isAuthenticated) {
//       autoResolve(authStore.auth);
//     } else {
//       resolvedData = {};
//     }
//   });

//   async function autoResolve(auth) {
//     isLoading = true;

//     try {
//       const [userData, projects, permissions] = await Promise.all([
//         fetchUserData(auth.token),
//         fetchProjects(auth.token),
//         fetchPermissions(auth.token)
//       ]);

//       resolvedData = { userData, projects, permissions };
//     } finally {
//       isLoading = false;
//     }
//   }

//   return {
//     get data() { return resolvedData; },
//     get isLoading() { return isLoading; }
//   };
// }
