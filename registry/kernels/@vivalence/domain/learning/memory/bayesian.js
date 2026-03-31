import * as ebisu from "ebisu-js";
import { time } from "@vivalence/typology";

const DECAY = 0.5;
const HALFLIFE_MIN = 0.01;
const HALFLIFE_MAX = 24 * 365 * 10;

const TAU = {
  MASTERY: 24,
  SUCCESS: 3.4,
  NEUTRAL: 1.0,
  MISTAKE: 0.15,
  FAILURE: 0.08,
};

const assess = ({ state }) => {
  const nextIn = ebisu.modelToPercentileDecay(state, DECAY);
  const nextAt = time.futureDatetime(nextIn);
  const status = !state
    ? "UNTOUCHED"
    : nextIn > 24 * 45
      ? "GRADUATED"
      : nextIn > 24 * 7
        ? "KNOWN"
        : nextIn >= 6
          ? "LEARNING"
          : "UNKNOWN";
  return { status, nextIn, nextAt };
};

const encode = (signal) => {
  let tau;
  if (signal.enum) {
    tau = TAU[signal.enum];
    if (tau == null) throw new Error(`Invalid signal enum: ${signal.enum}`);
  } else if (signal.ratio) {
    const r = signal.ratio.success / signal.ratio.total;
    tau = r >= 1 ? 8 : r > 0.8 ? 2.4 : 0.26;
  } else {
    throw new Error("No signal provided to encode memory");
  }
  const state = ebisu.defaultModel(tau, 4, 4);
  return { state, ...assess({ state }) };
};

const clamp = (state) => {
  const [a, b, t] = state;
  return [a, b, Math.max(HALFLIFE_MIN, Math.min(HALFLIFE_MAX, t))];
};

const evolve = (signal, memory) => {
  const elapsed = Math.max(time.hoursBetween(memory.lastAt), 0.001);
  let state = memory.state;

  if (signal.enum) {
    switch (signal.enum) {
      case "MASTERY":
        state = ebisu.updateRecall(state, 1, 1, elapsed);
        state = ebisu.rescaleHalflife(state, 3);
        break;
      case "SUCCESS":
        state = ebisu.updateRecall(state, 1, 1, elapsed);
        break;
      case "NEUTRAL":
        state = ebisu.updateRecall(state, 0.5, 1, elapsed);
        break;
      case "MISTAKE":
        state = ebisu.updateRecall(state, 0, 1, elapsed);
        break;
      case "FAILURE":
        state = ebisu.updateRecall(state, 0, 1, elapsed);
        state = ebisu.rescaleHalflife(state, 0.3);
        break;
      default:
        throw new Error(`Invalid signal enum: ${signal.enum}`);
    }
  } else if (signal.ratio) {
    state = ebisu.updateRecall(state, signal.ratio.success, signal.ratio.total, elapsed);
  } else {
    throw new Error("No signal provided to evolve memory");
  }

  state = clamp(state);
  return { state, ...assess({ state }) };
};

export default {
  type: "BAYESIAN",
  encode,
  evolve,
  assess,
  sql: {
    strength: (table) =>
      `exp(-(julianday('now') - julianday(${table}.lastAt / 1000.0, 'unixepoch')) * 24.0 / json_extract(${table}.state, '$[2]'))`,
  },
};
