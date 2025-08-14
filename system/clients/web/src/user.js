import { Call, withAuth, authorize } from "@client/lib/call/index.js";

import { auth } from "@client/auth";

if (!auth.isIdentified) {
  throw new Error("Unauthorized");
}

export const user = await (async () => {
  const user = { runtimes: [] };

  for (const shard of auth.identity.shards) {
    if (shard.runtime) {
      const runtime = {
        slug: shard.runtime,
        url: shard.url,
        call: new Call(shard.url).use(authorize(auth)),
        intents: [],
        modules: {},
      };

      const intents = await runtime.call(
        "/identity/shard/entities/intent/find",
      );

      intents.map((i) => runtime.intents.push(i));

      user.runtimes.push(runtime);
    }
  }

  return user;
})();

export default user;
