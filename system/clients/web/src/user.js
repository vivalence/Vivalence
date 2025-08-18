import { Call, withAuth, authorize } from "./prototypes/call/index.js";

import { authority } from "@client/authority";

if (!authority.isIdentified) {
  throw new Error("Unauthorityorized");
}

export const user = await (async () => {
  const user = { runtimes: [] };

  // for (const shard of authority.identity.shards) {
  //   if (shard.runtime) {
  //     const runtime = {
  //       slug: shard.runtime,
  //       url: shard.url,
  //       call: new Call(shard.url).use(authorityorize(auth)),
  //       intents: [],
  //       modules: {},
  //     };

  //     const intents = await runtime.call(
  //       "/identity/shard/entities/intent/find",
  //     );

  //     intents.map((i) => runtime.intents.push(i));
  //     user.runtimes.push(runtime);
  //   }
  // }

  return user;
})();

export default user;
