import { mergeProps } from "solid-js";

export const TONES = ["", "pos", "pri", "cau", "neg", "mut"];

export const dotted = (held) => ["dot", held.tone, held.live && "live", held.breathe && "breathe"].filter((word) => word).join(" ");

export const Dot = (props) => {
  const held = mergeProps({ tone: "", live: false, breathe: false, dim: false }, props);
  return <span class={dotted(held)} style={held.dim ? "opacity:.35" : undefined} />;
};
