import { time } from "@vivalence/typology";
import { SIGNAL } from "../types.js";

const STEPS = [1 / 60, 10 / 60];
const RELEARN_STEPS = [10 / 60];
const GRADUATE = 24;
const EASY_GRADUATE = 4 * 24;
const EASE_START = 2.5;
const EASE_FLOOR = 1.3;
const HARD_FACTOR = 1.2;
const EASY_BONUS = 1.3;
const LAPSE_FACTOR = 0.5;
const MIN_INTERVAL = 1;
const MAX_INTERVAL = 365 * 10;
const MATURE = 21;

const fresh = () => ({
  phase: "LEARNING",
  step: 0,
  ease: EASE_START,
  interval: 0,
  reps: 0,
  lapses: 0,
});

const status = (state) =>
  !state
    ? "UNTOUCHED"
    : state.phase === "RELEARNING"
      ? "UNKNOWN"
      : state.phase === "LEARNING"
        ? "LEARNING"
        : state.interval >= MATURE
          ? "GRADUATED"
          : "KNOWN";

const horizon = (state) =>
  state.phase === "LEARNING"
    ? STEPS[state.step] ?? GRADUATE
    : state.phase === "RELEARNING"
      ? RELEARN_STEPS[state.step] ?? state.interval * 24
      : state.interval * 24;

const assess = ({ state }) => {
  const nextIn = state ? horizon(state) : 0;
  return { status: status(state), nextIn, nextAt: time.futureDatetime(nextIn) };
};

const clamp = (days) => Math.min(MAX_INTERVAL, Math.max(MIN_INTERVAL, Math.round(days)));

const stepwise = (state, grade, steps, graduateTo) => {
  if (grade === "AGAIN") return { ...state, step: 0 };
  if (grade === "HARD") return { ...state };
  if (grade === "EASY")
    return { ...state, phase: "REVIEW", step: 0, interval: EASY_GRADUATE / 24 };
  const step = state.step + 1;
  if (step < steps.length) return { ...state, step };
  return { ...state, phase: "REVIEW", step: 0, interval: graduateTo / 24 };
};

const reviewing = (state, grade) => {
  if (grade === "AGAIN")
    return {
      ...state,
      phase: "RELEARNING",
      step: 0,
      lapses: state.lapses + 1,
      ease: Math.max(EASE_FLOOR, state.ease - 0.2),
      interval: clamp(state.interval * LAPSE_FACTOR),
    };
  if (grade === "HARD")
    return {
      ...state,
      ease: Math.max(EASE_FLOOR, state.ease - 0.15),
      interval: clamp(state.interval * HARD_FACTOR),
    };
  if (grade === "EASY")
    return {
      ...state,
      ease: state.ease + 0.15,
      interval: clamp(
        Math.max(state.interval * state.ease + 1, state.interval * state.ease * EASY_BONUS),
      ),
    };
  return { ...state, interval: clamp(state.interval * state.ease) };
};

const step = (state, grade) =>
  state.phase === "REVIEW"
    ? reviewing(state, grade)
    : state.phase === "RELEARNING"
      ? stepwise(state, grade, RELEARN_STEPS, state.interval * 24)
      : stepwise(state, grade, STEPS, GRADUATE);

const grade = (signal) => {
  if (signal.enum) {
    if (!SIGNAL.includes(signal.enum))
      throw new Error(`Invalid SM2 signal: ${signal.enum}`);
    return signal.enum;
  }
  if (signal.ratio) {
    const r = signal.ratio.success / signal.ratio.total;
    return r >= 1 ? "EASY" : r > 0.8 ? "GOOD" : r > 0.4 ? "HARD" : "AGAIN";
  }
  throw new Error("No signal provided");
};

const encode = (signal) => {
  const state = { ...step(fresh(), grade(signal)), reps: 1 };
  return { state, ...assess({ state }) };
};

const evolve = (signal, retention) => {
  const prior = retention.state?.phase ? retention.state : fresh();
  const state = { ...step(prior, grade(signal)), reps: (prior.reps ?? 0) + 1 };
  return { state, ...assess({ state }) };
};

export const preview = (state) =>
  Object.fromEntries(
    SIGNAL.map((g) => {
      const next = step(state ?? fresh(), g);
      return [g, horizon(next)];
    }),
  );

export default {
  type: "SM2",
  encode,
  evolve,
  assess,
  preview,
  sql: {
    strength: (table) =>
      `min(1.0, coalesce(json_extract(${table}.state, '$.interval'), 0.0) / ${MATURE}.0)`,
  },
};
