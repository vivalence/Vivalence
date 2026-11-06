const WEIGHTS = [
  [(word) => /[.!?…]["'”’)\]]*$/.test(word), 2.2],
  [(word) => /[,;:—–]["'”’)\]]*$/.test(word), 1.5],
  [(word) => /\d/.test(word), 1.4],
  [(word) => word.length > 12, 1.35],
  [(word) => word.length > 8, 1.15],
  [(word) => word.length < 3, 0.8],
  [() => true, 1],
];
const PAUSES = { off: 0, light: 1, strong: 2 };
const TERMINAL = /[.!?…]["'”’)\]]*$/;
const PIVOTS = [[1, 0], [5, 1], [9, 2], [13, 3], [Infinity, 4]];
const RAMP = 5;

export const HALTS = ["code", "table", "image", "block"];

const worded = (text, hold) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.map((word, index) => ({ text: word, hold: index === words.length - 1 ? hold : 1 }));
};

const TOKENS = [
  [(kind) => HALTS.includes(kind), () => []],
  [(kind) => kind === "h1" || kind === "h2", (node) => [{ text: node.textContent.trim(), hold: Math.max(4, worded(node.textContent, 1).length) }]],
  [(kind) => kind === "list", (node) => [...node.children].flatMap((item) => worded(item.textContent, 2.2))],
  [() => true, (node) => worded(node.textContent, 3)],
];

export const tokens = (kind, node) => TOKENS.find(([fits]) => fits(kind))[1](node);

const weight = (word, pauses) => 1 + (WEIGHTS.find(([fits]) => fits(word))[1] - 1) * PAUSES[pauses];

export const dwell = (frame, settings, played) =>
  frame.reduce((sum, token) => sum + weight(token.text, settings.pauses) * token.hold, 0) *
  (60000 / settings.wpm) *
  (1 + 0.6 * Math.max(0, 1 - played / RAMP));

export const sentences = (list) =>
  list.reduce(
    (starts, token, index) => (TERMINAL.test(token.text) && index + 1 < list.length ? [...starts, index + 1] : starts),
    [0],
  );

export const sentence = (list, index) => sentences(list).findLastIndex((start) => start <= index);

export const span = (list, index) => {
  const starts = [...sentences(list), list.length];
  const found = sentence(list, index);
  return [starts[found], starts[found + 1]];
};

export const pivot = (word) => {
  const lead = word.search(/[\p{L}\p{N}]/u);
  const core = word.slice(Math.max(0, lead)).replace(/[^\p{L}\p{N}]+$/u, "");
  const offset = PIVOTS.find(([length]) => core.length <= length)[1];
  const at = Math.max(0, lead) + Math.min(offset, Math.max(0, core.length - 1));
  return [word.slice(0, at), word.slice(at, at + 1), word.slice(at + 1)];
};
