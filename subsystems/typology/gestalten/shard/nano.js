import { Aperture } from "../../prototypes/aperture.js";
import { Broadcaster } from "../../prototypes/broadcaster.js";

export function atom(store) {
  const aperture = new Aperture();
  const broadcaster = new Broadcaster();
  store.listen((value) => broadcaster.push(value));

  aperture.open("/", () => store.get());
  aperture.open("/subscribe", (input, ctx) => {
    const { iterable, unsubscribe } = broadcaster.subscribe();
    ctx.request.raw?.signal?.addEventListener("abort", unsubscribe);
    ctx.response.body = (async function* () {
      yield store.get();
      yield* iterable;
    })();
  });

  return aperture;
}

export function transient(connection, store) {
  return connection.subscribe("/subscribe", (value) => store.set(value));
}
