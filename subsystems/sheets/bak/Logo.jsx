import { For } from "solid-js";
import { usePalette } from "./palette.js";

const MARK = ["╲       ╱", " ╲     ╱ ", "  ╲   ╱  ", "   ╲ ╱   ", "    ✦    "];

const Glyph = (palette) => <text fg={palette.signalPrimary}><b>✦</b></text>;

const Word = (palette) => (
  <text>
    <span fg={palette.signalPrimary}><b>viva</b></span>
    <span fg={palette.textLink}><b>lence</b></span>
  </text>
);

const Signed = (palette) => (
  <box style={{ flexDirection: "row", gap: 1 }}>
    {Glyph(palette)}
    {Word(palette)}
  </box>
);

const Banner = (palette) => (
  <box style={{ flexDirection: "column", alignItems: "center" }}>
    <For each={MARK}>{(line) => <text fg={palette.signalPrimary}>{line}</text>}</For>
    {Word(palette)}
  </box>
);

const VARIANTS = { mark: Glyph, word: Signed, banner: Banner };

export function Logo(props) {
  if (!Object.hasOwn(VARIANTS, props.variant)) {
    throw new Error(`[tty] Logo variant: ${JSON.stringify(props.variant)} · ${Object.keys(VARIANTS).join(" · ")}`);
  }
  return VARIANTS[props.variant](usePalette());
}
