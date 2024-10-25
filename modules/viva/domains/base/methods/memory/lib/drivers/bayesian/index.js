import * as ebisu from "ebisu-js";
import { time } from "@vivalence/shared";

// MASTERY +10
// SUCCESS  +1
// NEUTRAL   0
// MISTAKE  -1
// FAILURE -10

const DECAY_THRESHOLD = 0.75;
const GRADUATION_SCALE = 10;
const FAILURE_SCALE = 0.1;

const initiate = (signal) => {
  if (!signal || (!signal.enum && !signal.ratio))
    throw new Error("No signal provided to initiate memory");

  let alpha = 4,
    beta = 4,
    tau = 0.1;

  if (typeof signal.enum === "string") {
    switch (signal.enum) {
      case "MASTERY":
        tau = 24;
        break;
      case "SUCCESS":
        tau = 3.4;
        break;
      case "NEUTRAL":
        tau = 1.0;
        break;
      case "MISTAKE":
        tau = 0.26;
        break;
      case "FAILURE":
        tau = 0.1;
        break;
      default:
        throw new Error(`Invalid signal enum: ${signal}`);
        break;
    }
  } else if (signal.ratio) {
    const ratio = signal.ratio.success / signal.ratio.total;
    if (ratio === 1) {
      tau = 8;
    } else if (ratio > 0.8) {
      tau = 2.4;
    } else {
      tau = 0.26;
    }
  }

  return ebisu.defaultModel(tau, alpha, beta);
};

const schedule = ({ state }) => {
  const nextIn = ebisu.modelToPercentileDecay(state, DECAY_THRESHOLD);
  const nextAt = time.futureDatetime(nextIn);
  return { nextIn, nextAt };
};

const strength = (memory) => {
  return ebisu.predictRecall(memory.state, time.hoursBetweenDates(memory.lastAt));
};

const status = ({ state, nextIn, history }) => {
  if (!state) return "UNTOUCHED";

  const checkLastResponses = (n, condition) => {
    const recentSignals = history
      .map(({ signal }) => {
        if (!signal.enum && signal.ratio) {
          const ratio = signal.ratio.success / signal.ratio.total;
          signal.enum = ratio >= 0.5 ? "SUCCESS" : "FAILURE";
        }
        return signal;
      })
      .filter((signal) => signal.enum)
      .filter((e) => e !== "NEUTRAL")
      .slice(-n);

    return recentSignals.every((signal) => condition.includes(signal.enum));
  };

  const isUnknown = nextIn < 1 || checkLastResponses(3, ["FAILURE", "MISTAKE"]);
  const isLearning = nextIn >= 1;
  const isKnown = nextIn > 24 * 7 && checkLastResponses(3, ["SUCCESS", "MASTERY"]);
  const isGraduated = nextIn > 24 * 14 && checkLastResponses(5, ["SUCCESS", "MASTERY"]);

  if (isUnknown) {
    return "UNKNOWN";
  } else if (isGraduated) {
    return "GRADUATED";
  } else if (isKnown) {
    return "KNOWN";
  } else if (isLearning) {
    return "LEARNING";
  } else return "UNKNOWN";
};

const update = (memory, signal) => {
  if (!signal || (!signal.enum && !signal.ratio))
    throw new Error("No valid signal provided to update memory");

  const elapsedTime = time.hoursBetween(memory.lastAt);

  try {
    if (typeof signal.enum === "string") {
      switch (signal.enum) {
        case "MASTERY":
          state = ebisu.updateRecall(memory.state, 1, 1, elapsedTime);
          state = ebisu.rescaleHalflife(memory.state, GRADUATION_SCALE);
          break;
        case "SUCCESS":
          state = ebisu.updateRecall(memory.state, 1, 1, elapsedTime);
          break;
        case "NEUTRAL":
          state = ebisu.updateRecall(memory.state, 0.5, 1, elapsedTime);
          break;
        case "MISTAKE":
          state = ebisu.updateRecall(memory.state, 0, 1, elapsedTime);
          break;
        case "FAILURE":
          state = ebisu.updateRecall(memory.state, 0, 1, elapsedTime);
          state = ebisu.rescaleHalflife(memory.state, FAILURE_SCALE);
          break;
        default:
          throw new Error(`Invalid response: ${signal}`);
      }
    } else if (signal.ratio) {
      state = ebisu.updateRecall(
        memory.state,
        signal.ratio.success,
        signal.ratio.total,
        elapsedTime,
      );
    }
  } catch (error) {
    console.log("\n\n\n\n\n\n\n\n");
    console.log("[EBISU ERROR]");
    console.error(error);
    console.log("\n\nCONTINUING\n\n\n\n\n\n");
  } finally {
    return state;
  }
};

export default { initiate, schedule, strength, status, update };
