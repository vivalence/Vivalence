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
