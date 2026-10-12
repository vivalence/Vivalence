import { atom } from "nanostores";
import { fn, mime } from "@vivalence/typology";
import { tokens } from "@vivalence/dapper";
import { captured, chassis as build, keypresses, kinds, paint, SLOTS } from "@vivalence/sheets";
import { panes } from "./out/panes.mjs";

const known = (kind) => {
  if (!Object.hasOwn(kinds, kind)) throw new Error(`[tty] no kind ${JSON.stringify(kind)} · ${Object.keys(kinds).join(" · ")}`);
  return kinds[kind];
};

export const tty = (renderer, { credentials, theme = "northsea" }) => {
  const ground = tokens(theme, "1");
  const accept = [mime.tty.solid, mime.markdown, mime.plain, mime.json];
  const $layout = atom({ crown: true, navigation: true });
  const $output = atom(null);
  const frame = fn.memo(() => build(renderer, theme));
  const pane = (name, extra) => (client) => {
    const slot = SLOTS[name];
    const erase = paint(frame().slots[slot], renderer, frame().palettes[slot], panes[name], { client, $layout, $output, ...extra });
    return { place: frame().place, destroy: erase };
  };
  return {
    name: "tty",
    interactive: true,
    viewport: () => ({ width: renderer.width, height: renderer.height }),
    credentials,
    accept,
    keys: (async function* () {
      for await (const press of keypresses(renderer).drain()) {
        if (press.key === "ctrl-c") Deno.kill(Deno.pid, "SIGINT");
        else yield `/key/${press.key}`;
      }
    })(),
    emit: (kind, props) => $output.set({ kind, props }),
    hold: (kind, props) => captured(renderer, { ...props, width: renderer.width }, known(kind), ground).released,
    mount: { signin: pane("signin", {}), crown: pane("crown", {}), dock: pane("dock", {}), frame: pane("frame", { accept }), navigation: pane("navigation", {}) },
  };
};
