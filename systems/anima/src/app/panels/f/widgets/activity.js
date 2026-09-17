// the row's projection: a wire activity carries status · error · a ring of 12 records.
// path, elapsed and the span bars are FOLDED off that ring — the daemon sends none of them.
import { v } from "@vivalence/typology";

const MACHINE = v.primitives.controller.MACHINE;

export const settled = (code) => MACHINE.states[code]?.settled ?? false;
export const root = (steps) => steps?.[0]?.path ?? "/hallucination";

// one bar per path the ring mentions, in the order first seen; an unclosed span ends at `now`.
export function spans(steps = []) {
  const held = new Map();
  for (const step of steps) {
    const span = held.get(step.path) ?? { path: step.path, start: step.at, end: null };
    if (step.verb === "close" || step.verb === "fault" || step.verb === "abort") span.end = step.at;
    held.set(step.path, span);
  }
  return [...held.values()];
}

// the clock is the RING's, not the wall's: `at` is the daemon's performance.now(). a paused
// controller marks nothing, so the elapsed it yields freezes on its own — rule 2, for free.
export const elapsed = (steps = []) => {
  if (!steps.length) return 0;
  return (steps.at(-1).at - steps[0].at) / 1000;
};

export const label = (seconds) => `${seconds.toFixed(1)}s`;

export function flat(data, prefix = "") {
  if (data === null || data === undefined) return "";
  if (typeof data !== "object") return String(data);
  return Object.entries(data)
    .map(([key, value]) => {
      const nested = value !== null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
      return nested ? flat(value, `${prefix}${key}.`) : `${prefix}${key} ${typeof value === "string" ? value : JSON.stringify(value)}`;
    })
    .join(" · ");
}

// what the row hands ActivityRow — one object, no live entity reads inside the markup.
export function project(row) {
  const steps = row.steps ?? [];
  const code = row.status ?? "IDLE";
  const seconds = elapsed(steps);
  return {
    id: row.id,
    code,
    live: !settled(code),
    path: root(steps),
    elapsed: seconds,
    elapsedLabel: label(seconds),
    total: Math.max(seconds, 0.001),
    errorCode: row.error?.code ?? null,
    errorMessage: row.error?.message ?? "",
    steps: [...steps].reverse().map((step) => ({ ...step, offset: (step.at - (steps[0]?.at ?? 0)) / 1000, summary: flat(step.data) })),
    spans: spans(steps),
    ring: `${steps.length}/12`,
    links: [row.mode, row.turn, row.buffer]
      .map((ref, index) => [["mode", "turn", "buffer"][index], ref?.id ?? ref])
      .filter(([, id]) => id)
      .map(([name, id]) => `${name} ${String(id).slice(-6)}`)
      .join(" · "),
  };
}
