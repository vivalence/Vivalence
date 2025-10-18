import { mount, unmount } from "svelte";

export * from "./components/index.js";

import useBox from "./lib/useBox.svelte.js";
import * as components from "./components/index.js";

export const lib = { useBox };

export const manifest = { type: "surface", slug: "html" };

export function pack(Component) {
  return (target, props) => {
    const instance = mount(Component, { target, props });
    return {
      instance,
      destroy: () => unmount(instance),
    };
  };
}

export default components;
