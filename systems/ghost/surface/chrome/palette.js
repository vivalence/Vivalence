import { createContext, useContext } from "solid-js";

export const Palette = createContext();

export const usePalette = () => {
  const palette = useContext(Palette);
  if (palette === undefined) throw new Error("[tty] no palette: a component paints through paint");
  return palette;
};

export const TONES = {
  primary: "signalPrimary",
  positive: "signalPositive",
  caution: "signalCaution",
  negative: "signalNegative",
  strong: "textStrong",
  ink: "textInk",
  muted: "textMuted",
  link: "textLink",
};

export const tone = (palette, name) => {
  if (!Object.hasOwn(TONES, name)) throw new Error(`[tty] not a tone: ${JSON.stringify(name)} · ${Object.keys(TONES).join(" · ")}`);
  return palette[TONES[name]];
};
