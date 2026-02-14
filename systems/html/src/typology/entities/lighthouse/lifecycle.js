import { effect } from "nanostores";

const STORAGE_KEY = (url) => `lighthouse:${url}`;

const hydrateFromStorage = (lighthouse) => {
  const key = STORAGE_KEY(lighthouse.connection.url);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const { authority, identity } = JSON.parse(stored);
      if (authority) lighthouse.$authority.set(authority);
      if (identity) lighthouse.$identity.set(identity);
    } catch {
      localStorage.removeItem(key);
    }
  }
};

const persistToStorage = (lighthouse) => {
  const key = STORAGE_KEY(lighthouse.connection.url);

  return effect(
    [lighthouse.$authority, lighthouse.$identity],
    (authority, identity) => {
      if (authority || identity) {
        localStorage.setItem(key, JSON.stringify({ authority, identity }));
      } else {
        localStorage.removeItem(key);
      }
    },
  );
};

export async function lifecycle(lighthouse) {
  hydrateFromStorage(lighthouse);

  const verifyResult = await lighthouse.verify();

  if (verifyResult.status === "OK" || verifyResult.status === "NETWORK_ERROR") {
    if (lighthouse.$isAuthorized.get()) {
      try {
        lighthouse.manifest = await lighthouse.connection.call("/manifest");
      } catch (error) {
        // manifest fetch failed, continue anyway
        console.log("error fetching manifest", error);
      }
    }
  }

  persistToStorage(lighthouse);

  return lighthouse;
}
// import { effect } from "nanostores";
// import { shards } from "@vivalence/html/typology";
// import { Connection } from "@vivalence/typology";
// import { Lighthouse } from "./prototype.js";
// import { dataspace } from "$client";

// const hydrateFromStorage = (lighthouse) => {
//   const key = `lighthouse:${lighthouse.connection.url}`;
//   const stored = localStorage.getItem(key);

//   // console.log("hydrate", lighthouse, { key, stored });

//   if (stored) {
//     const { authority, identity } = JSON.parse(stored);
//     lighthouse.$authority.set(authority);
//     lighthouse.$identity.set(identity);
//   }
// };

// const persistToStorage = (lighthouse) => {
//   const key = `lighthouse:${lighthouse.connection.url}`;

//   effect([lighthouse.$authority, lighthouse.$identity], (auth, identity) => {
//     const value = JSON.stringify({ authority: auth, identity });
//     // console.log("persiting lighhouse", lighthouse, { key, value });
//     localStorage.setItem(key, value);
//   });
// };

// export async function lifecycle(lighthouse) {
//   // console.log("cycling lighthouse", lighthouse);
//   hydrateFromStorage(lighthouse);
//   await lighthouse.verify(lighthouse);
//   if (lighthouse.$isAuthorized.get()) {
//     lighthouse.manifest = await lighthouse.connection.call("/manifest");
//   }
//   persistToStorage(lighthouse);
//   // console.log("cycled lighthouse", lighthouse);

//   return lighthouse;
// }

// // async function validate(lighthouse) {
// //   const auth = lighthouse.$authority.get();
// //   if (!auth?.access) return;
// //   const result = await lighthouse.verify();
// //   if (!result.valid) await lighthouse.refresh();
// // }

// // async function loadDaemons(lighthouse) {
// // const daemons = await lighthouse.connection.call("/entities/daemon/find");
// // for (const remote of daemons) {
// //   const exists = await remotes.daemon //
// //     .findOne((d) => d.connection.url === remote.url);

// //   if (exists) continue;

// //   const connection = new Connection(remote.url) //
// //     .use(shards.connection.authorize(lighthouse.$authority));

// //   await dataspace.daemon.spawn(connection);

// //   //         const connection = new Connection(remote.url) //
// //   //           .use(authorize(lighthouse.$authority));
// //   //         await remotes.daemon.spawn(connection);
// // } //
// // }
// // const authorize = ($authority) => async (ctx, next) => {
// //   const auth = $authority.get();
// //   if (auth?.access) {
// //     ctx.request.headers.Authorization = `Bearer ${auth.access}`;
// //   }
// //   await next();
// // };
// // console.log(lighthouse.connection.state.get());
// // console.log(lighthouse.connection.status.code.get());
// // console.log(lighthouse.authority.get(), lighthouse.identity.get());
