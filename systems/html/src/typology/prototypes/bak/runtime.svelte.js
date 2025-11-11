import { SvelteSet } from "svelte/reactivity";
import { authorize } from "./call/middlewares.js";
import { createService } from "./service.svelte.js";

export function createRuntime(shard) {
  const service = createService(shard.url);
  const runtime = {
    ...service,
    shard,
    entities: { intent: new SvelteSet(), session: new SvelteSet() },
  };
  runtime.call.use(authorize(shard.authority));
  runtime.handshake();

  (async () => {
    const intents = await runtime.call("/shard/entities/intent/find");
    for (const intent of intents) {
      runtime.entities.intent.add(intent);
    }
  })();

  return runtime;
}
