import * as ebisu from "ebisu-js";
import { time } from "@vivalence/typology";

// MASTERY +10
// SUCCESS  +1
// NEUTRAL   0
// MISTAKE  -1
// FAILURE -10

const DECAY_THRESHOLD = 0.9;

const initiate = ({ signal = {} }) => {
  if (typeof signal === "string") signal = { enum: signal };
  if (!signal.enum && !signal.ratio) throw new Error("No signal provided to initiate memory");

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
        tau = 0.15;
        break;
      case "FAILURE":
        tau = 0.08;
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

const schedule = ({ memory }) => {
  const nextIn = ebisu.modelToPercentileDecay(memory.state, DECAY_THRESHOLD);
  const nextAt = time.futureDatetime(nextIn);
  return { nextIn, nextAt };
};

const strength = ({ memory }) => {
  return ebisu.predictRecall(memory.state, time.hoursBetweenDates(memory.lastAt), true);
};

const status = ({ memory }) => {
  if (!memory.state) return "UNTOUCHED";

  const checkLastResponses = (n, condition) => {
    const recentSignals = memory.history
      .map(({ signal }) => {
        if (typeof signal === "string") signal = { enum: signal };
        if (!signal.enum && signal.ratio) {
          const ratio = signal.ratio.success / signal.ratio.total;
          signal.enum = ratio >= 0.5 ? "SUCCESS" : "MISTAKE";
        }
        return signal;
      })
      .filter((signal) => signal.enum)
      .filter((e) => e !== "NEUTRAL")
      .slice(-n);

    return recentSignals.every((signal) => condition.includes(signal.enum));
  };

  // const isUnknown = memory.nextIn < 1 || checkLastResponses(3, ["FAILURE", "MISTAKE"]);
  // const isLearning = memory.nextIn >= 1;
  // const isKnown = memory.nextIn > 24 * 7 && checkLastResponses(3, ["SUCCESS", "MASTERY"]);
  // const isGraduated = memory.nextIn > 24 * 14 && checkLastResponses(5, ["SUCCESS", "MASTERY"]);
  const isUnknown = memory.nextIn < 6;
  const isLearning = memory.nextIn >= 6;
  const isKnown = memory.nextIn > 24 * 7;
  const isGraduated = memory.nextIn > 24 * 45;

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

const update = ({ memory, signal }) => {
  if (typeof signal === "string") signal = { enum: signal };
  if (!signal.enum && !signal.ratio) throw new Error("No valid signal provided to update memory");

  const elapsedTime = time.hoursBetween(memory.lastAt);

  let state = memory.state;

  try {
    if (typeof signal.enum === "string") {
      switch (signal.enum) {
        case "MASTERY":
          state = ebisu.updateRecall(memory.state, 1, 1, elapsedTime);
          state = ebisu.rescaleHalflife(memory.state, 10);
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
          state = ebisu.rescaleHalflife(memory.state, 0.1);
          break;
        default:
          console.log(
            "Bayesian Memory signal expected",
            "MASTERY, SUCCESS, NEUTRAL, MISTAKE, FAILURE",
          );
          console.log("SIGNAL received:", signal);
          throw new Error(
            `Invalid response: ${signal}. Must be one of [MASTERY, SUCCESS, NEUTRAL, MISTAKE, FAILURE]`,
          );
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
    console.log(signal, { ...memory, history: undefined });
    console.log("CONTINUING\n");
  } finally {
    return state;
  }
};

export default { initiate, schedule, strength, status, update };
