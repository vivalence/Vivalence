import { createSignal, onCleanup } from "solid-js";
import { useRenderer } from "@opentui/solid";
import { FRAMES } from "./Spinner.jsx";
import { tone, usePalette } from "./palette.js";

const SETTLED = {
  fulfilled: { glyph: "✓", tone: "positive" },
  rejected: { glyph: "✕", tone: "negative" },
};

export function Pending(props) {
  const palette = usePalette();
  const renderer = useRenderer();
  const [settled, setSettled] = createSignal({ glyph: FRAMES[0], tone: "primary" });
  const spin = (held) => ({ glyph: FRAMES[(FRAMES.indexOf(held.glyph) + 1) % FRAMES.length], tone: "primary" });
  const timer = setInterval(() => setSettled(spin), 80);
  onCleanup(() => clearInterval(timer));
  const settle = (outcome) => {
    clearInterval(timer);
    setSettled(SETTLED[outcome.status]);
    renderer.requestRender();
    renderer.idle().then(() => props.release(outcome));
  };
  props.work.then(
    (value) => settle({ status: "fulfilled", value }),
    (reason) => settle({ status: "rejected", reason }),
  );
  return <text fg={tone(palette, settled().tone)}>{`${settled().glyph} ${props.label}`}</text>;
}
