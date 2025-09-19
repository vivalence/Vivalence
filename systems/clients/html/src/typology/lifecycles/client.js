import { env } from "$env/dynamic/public";
// import { once } from "@vivalence/shared/fn";
import { Connection } from "@vivalence/typology";
import { Client } from "../prototypes/index.js";

async function reactivity(client) {
  client.remotes.lighthouse.onCreate((lighthouse) => {
    lighthouse.$identity.subscribe((identity) => {
      // console.log("lighthouse.$identity subscription", lighthouse, identity);
      // pull runtimes
      // await client.remotes.runtime.spawn(runtimeconfig);
    });
    // lighthouse.$identity.subscribe(onceonce(spawnRuntimes,i=>!!i, )) lol
  });
}

async function lighthouses(client) {
  const lurl = env["PUBLIC_VIVA_LIGHTHOUSE_URL"];
  if (!lurl) throw new Error("[PUBLIC_VIVA_LIGHTHOUSE_URL]@lifecycles/client ");
  const connection = new Connection(new URL(lurl));
  await client.remotes.lighthouse.spawn(connection);
}

export const lifecycle = async (client) => {
  await reactivity(client);
  await lighthouses(client);
  return client;
};

export default await lifecycle(new Client());

// export const lifecycle = async () => {
//   // // construct
//   // create whatever client stores, tools, vectors, and whatever else.
//   // create repositories for lighthouses runtimes and services.

//   // // populate
//   // create a single connection entity with the lighthouse url from config, and on success create lighthouse entity and add to repository.
//   // for each lighthouse, authenticate (if stored, validate), load identity object.

//   // // resolve
//   // instantiate runtimes and services from identity objects. also connection first.

//   // // integrate
//   // nothing yet.

//   return client;
// };
