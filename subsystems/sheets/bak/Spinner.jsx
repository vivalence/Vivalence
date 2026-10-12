import { createSignal, onCleanup } from "solid-js";
import { tone, usePalette } from "./palette.js";

export const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function Spinner(props) {
  const palette = usePalette();
  const [frame, setFrame] = createSignal(0);
  const timer = setInterval(() => setFrame((index) => (index + 1) % FRAMES.length), 80);
  onCleanup(() => clearInterval(timer));
  return <text fg={tone(palette, props.tone)}>{`${FRAMES[frame()]} ${props.label}`}</text>;
}
