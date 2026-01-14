export * from "./decor/index.js";
export * from "./display/index.js";
export * from "./controls/index.js";
export * from "./panels/index.js";
export * from "./triage/index.js";

import * as decor from "./decor/index.js";
import * as display from "./display/index.js";
import * as controls from "./controls/index.js";
import * as panels from "./panels/index.js";
import * as triage from "./triage/index.js";

export const components = {
  ...decor,
  ...triage,
  ...display,
  ...controls,
  ...panels,
};

export default components;

import { mount, unmount } from "svelte";

export function pack(Component) {
  return (target, props) => {
    const instance = mount(Component, { target, props });
    return {
      instance,
      // name:"",
      destroy: () => unmount(instance),
    };
  };
}

// export * from "./components/index.js";
// import useBox from "./lib/useBox.svelte.js";
// export const lib = { useBox };
