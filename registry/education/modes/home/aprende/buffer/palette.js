// shared visual vocabulary for the aprende homepage panels — one source so the
// memory blocks, the scatter, and the ranks list can never disagree on a colour.

export const STATUS = ["UNTOUCHED", "UNKNOWN", "LEARNING", "KNOWN", "GRADUATED"];

export const STATUS_COLOR = {
  UNTOUCHED: "#3b3b3b",
  UNKNOWN: "#6b5b73",
  LEARNING: "#c4a35a",
  KNOWN: "#5b8c5a",
  GRADUATED: "#3a7ca5",
};

export const DUE = "#c4715a";
export const MUTED = "#8b8b93";
export const TEAL = "#1EBCB5";

// ontology → glyph (legend / list) + echarts symbol + size
export const ONTOLOGY = {
  word: { glyph: "●", symbol: "circle", size: 9 },
  sentence: { glyph: "▬", symbol: "rect", size: 10.5 },
  conjugation: { glyph: "◆", symbol: "diamond", size: 15 },
};
