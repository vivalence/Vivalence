import { createComponent, writeSolidToScrollback } from "@opentui/solid";
import { Palette } from "./out/views.mjs";

export const cut = (renderer, props, Component, palette) =>
  writeSolidToScrollback(renderer, () =>
    createComponent(Palette.Provider, {
      value: palette,
      get children() {
        return createComponent(Component, props);
      },
    }),
  );
