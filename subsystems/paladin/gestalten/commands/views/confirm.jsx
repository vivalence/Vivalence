import { onCleanup, onMount } from "solid-js";
import { _render, createComponent, RendererContext } from "@opentui/solid";

const Confirm = (props) => {
  const keys = (key) => {
    if (key.name === "y") props.answer({ yes: true });
    else if (key.name === "n" || key.name === "escape") props.answer({ yes: false });
    else if (key.name === "return") props.answer({ yes: props.initial === true });
  };
  onMount(() => props.renderer.keyInput.prependListener("keypress", keys));
  onCleanup(() => props.renderer.keyInput.off("keypress", keys));
  return (
    <box style={{ flexDirection: "column" }}>
      <text>{props.label}</text>
      <text>{props.initial === true ? "[Y/n]" : "[y/N]"}</text>
    </box>
  );
};

export default (element, props) => {
  const dispose = _render(
    () =>
      createComponent(RendererContext.Provider, {
        value: props.renderer,
        get children() {
          return createComponent(Confirm, props);
        },
      }),
    element,
  );
  return {
    destroy: () => {
      dispose();
      for (const child of element.getChildren()) child.destroyRecursively();
    },
  };
};
