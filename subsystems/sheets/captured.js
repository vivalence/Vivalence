import { BoxRenderable } from "@opentui/core";
import { _render } from "@opentui/solid";
import { fn } from "@vivalence/typology";
import { provide } from "./paint.js";

export const captured = (renderer, props, Component, palette) => {
  const slot = new BoxRenderable(renderer, { id: `captured-${crypto.randomUUID()}`, flexDirection: "column", width: "100%" });
  const released = Promise.withResolvers();
  const release = fn.once((opts) => {
    renderer.root.remove(slot);
    renderer.writeToScrollback(() => ({ root: slot, teardown: dispose }));
    released.resolve(opts);
    return opts;
  });
  renderer.root.add(slot);
  const dispose = _render(provide(renderer, palette, Component, { ...props, release }), slot);
  return { release, released: released.promise };
};
