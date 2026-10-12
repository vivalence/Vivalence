import { _render, createComponent, RendererContext } from "@opentui/solid";
import { Palette } from "./out/panes.mjs";

const provide = (renderer, palette, Component, props) => () =>
  createComponent(RendererContext.Provider, {
    value: renderer,
    get children() {
      return createComponent(Palette.Provider, {
        value: palette,
        get children() {
          return createComponent(Component, props);
        },
      });
    },
  });

export const paint = (slot, renderer, palette, Component, props) => {
  const dispose = _render(provide(renderer, palette, Component, props), slot);
  return () => {
    dispose();
    for (const child of slot.getChildren()) child.destroyRecursively();
  };
};
