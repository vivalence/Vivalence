import { v } from "@vivalence/typology";

export const GROUPS = ["none", "thread", "mode", "turn", "buffer"];
export const CODES = Object.keys(v.primitives.controller.MACHINE.states);
export const SIGNALS = { s: "SIGSTOP", n: "SIGCONT", t: "SIGTERM", k: "SIGKILL" };

export const init = () => ({ cursor: null, group: 0, grains: false });

const idOf = (ref) => (ref && typeof ref === "object" ? ref.id : ref) ?? "";
export const sorted = (rows, state) => {
  const key = GROUPS[state.group];
  return key === "none" ? rows : [...rows].sort((a, b) => String(idOf(a[key])).localeCompare(String(idOf(b[key]))));
};

export const held = (rows, state, fallback = 0) => {
  const list = sorted(rows, state);
  return list.find((row) => row.id === state.cursor) ?? list[Math.min(fallback, list.length - 1)] ?? null;
};

export function react(state, { input = "", key = {} }, rows) {
  const list = sorted(rows, state);
  const row = held(rows, state);
  const index = row ? list.indexOf(row) : -1;
  const move = (step) => {
    const next = list[Math.max(0, Math.min(list.length - 1, index + step))];
    return { state: { ...state, cursor: next?.id ?? null } };
  };
  if (key.upArrow || input === "K") return move(-1);
  if (key.downArrow || input === "J") return move(1);
  if (input === "q" || key.escape) return { state, effect: { kind: "quit" } };
  if (input === "g") return { state: { ...state, group: (state.group + 1) % GROUPS.length } };
  if (!row) return { state };
  if (key.return) return { state: { ...state, cursor: row.id, grains: !state.grains } };
  if (SIGNALS[input]) return { state: { ...state, cursor: row.id }, effect: { kind: "signal", id: row.id, name: SIGNALS[input] } };
  return { state };
}
