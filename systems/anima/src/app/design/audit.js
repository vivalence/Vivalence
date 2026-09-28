import { contrast, flatten } from "@vivalence/dapper/contrast";

export const DEPTHS = ["--surface", "--surface-sunk", "--surface-lift"];
export const SIGNALS = ["primary", "positive", "caution", "negative"];
const PROSE = ["header", "strong", "ink", "light", "link", "code"];

const pair = (held, label, glyph, ground, floor) => {
  const ratio = contrast(flatten(held[glyph], held[ground] ?? ground), held[ground] ?? ground);
  return { label, glyph, ground, floor, ratio, holds: ratio >= floor };
};

const washed = (held, signal, depth) => {
  const ground = flatten(held[`--signal-${signal}-tint`], held[depth]);
  const ratio = contrast(held[`--signal-${signal}-ink`], ground);
  return { label: `${signal} ink on its tint over ${depth.slice(2)}`, glyph: `--signal-${signal}-ink`, ground: depth, floor: 4.5, ratio, holds: ratio >= 4.5 };
};

export const audit = (held) => [
  ...DEPTHS.flatMap((depth) => [
    ...PROSE.map((step) => pair(held, `${step} on ${depth.slice(2)}`, `--text-${step}`, depth, 4.5)),
    pair(held, `muted on ${depth.slice(2)}`, "--text-muted", depth, 3),
    ...SIGNALS.map((signal) => pair(held, `${signal} ink on ${depth.slice(2)}`, `--signal-${signal}-ink`, depth, 4.5)),
    ...SIGNALS.map((signal) => washed(held, signal, depth)),
    pair(held, `focus ring on ${depth.slice(2)}`, "--control-focus", depth, 3),
  ]),
  ...SIGNALS.map((signal) => pair(held, `glyph on the ${signal} fill`, `--signal-${signal}-on`, `--signal-${signal}`, 4.5)),
  pair(held, "label on a key", "--control-on", "--control-contrast", 4.5),
  pair(held, "label on a hovered key", "--control-on", "--control-contrast-hover", 4.5),
  pair(held, "label on a pressed key", "--control-on-pressed", "--control-contrast-pressed", 4.5),
  pair(held, "glyph on the inverted block", "--inverse-on", "--inverse", 4.5),
  pair(held, "a value in a field", "--text-strong", "--control-field", 4.5),
  pair(held, "muted label on a key", "--control-on-muted", "--control-contrast", 3),
  pair(held, "placeholder in a field", "--control-field-placeholder", "--control-field", 3),
];

export const verdict = (rows) => ({ pairs: rows.length, misses: rows.filter((row) => !row.holds), worst: Math.min(...rows.map((row) => row.ratio / row.floor)) });
