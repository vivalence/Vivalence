import { time } from "@vivalence/shared";

const DECAY_THRESHOLD = 0.75;
const BASE_HALFLIFE = 24; // hours
const GRADUATED_THRESHOLD = 0.85;
const KNOWN_THRESHOLD = 0.7;
const LEARNING_THRESHOLD = 0.4;

const initiate = ({ signal = {} }) => {
  if (typeof signal === "string") signal = { enum: signal };
  if (!signal.enum && !signal.ratio) throw new Error("No signal provided to initiate memory");

  let state = {
    strength: 0.5,
    interference: 0,
  };

  if (signal.enum) {
    switch (signal.enum) {
      case "MASTERY":
        state.strength = 0.9;
        break;
      case "SUCCESS":
        state.strength = 0.7;
        break;
      case "NEUTRAL":
        state.strength = 0.5;
        break;
      case "MISTAKE":
        state.strength = 0.3;
        break;
      case "FAILURE":
        state.strength = 0.1;
        break;
      default:
        throw new Error(`Invalid signal enum: ${signal.enum}`);
    }
  } else if (signal.ratio) {
    state.strength = Math.max(0.1, Math.min(0.9, signal.ratio.success / signal.ratio.total));
  }

  return state;
};

const schedule = ({ memory }) => {
  if (!memory.state) return { nextIn: 0, nextAt: time.futureDatetime(0) };

  const currentStrength = strength({ memory });

  let nextIn;
  if (currentStrength >= GRADUATED_THRESHOLD) {
    nextIn = BASE_HALFLIFE * 14;
  } else if (currentStrength >= KNOWN_THRESHOLD) {
    nextIn = BASE_HALFLIFE * 7;
  } else if (currentStrength >= LEARNING_THRESHOLD) {
    nextIn = BASE_HALFLIFE * (currentStrength * 2);
  } else {
    nextIn = 1;
  }

  nextIn *= 1 - memory.state.interference * 0.5;
  const nextAt = time.futureDatetime(nextIn);
  return { nextIn, nextAt };
};

const strength = ({ memory }) => {
  if (!memory.state) return 0;

  const elapsedTime = time.hoursBetween(memory.lastAt);
  const decayFactor = Math.exp((-0.1 * elapsedTime) / BASE_HALFLIFE);

  return Math.max(0, memory.state.strength * decayFactor * (1 - memory.state.interference * 0.5));
};

const status = ({ memory }) => {
  if (!memory.state) return "UNTOUCHED";

  const currentStrength = strength({ memory });

  if (currentStrength >= GRADUATED_THRESHOLD) return "GRADUATED";
  if (currentStrength >= KNOWN_THRESHOLD) return "KNOWN";
  if (currentStrength >= LEARNING_THRESHOLD) return "LEARNING";
  return "UNKNOWN";
};

const update = ({ memory, signal }) => {
  if (typeof signal === "string") signal = { enum: signal };
  if (!signal.enum && !signal.ratio) throw new Error("No valid signal provided to update memory");

  if (!memory.state) return initiate({ signal });

  const elapsedTime = time.hoursBetween(memory.lastAt);
  const decayFactor = Math.exp((-0.1 * elapsedTime) / BASE_HALFLIFE);

  let newState = {
    strength: memory.state.strength * decayFactor,
    interference: memory.state.interference,
  };

  if (signal.enum) {
    switch (signal.enum) {
      case "MASTERY":
        newState.strength = Math.min(1, newState.strength + 0.3);
        newState.interference = Math.max(0, newState.interference - 0.2);
        break;
      case "SUCCESS":
        newState.strength = Math.min(1, newState.strength + 0.15);
        newState.interference = Math.max(0, newState.interference - 0.1);
        break;
      case "NEUTRAL":
        newState.interference *= 0.95;
        break;
      case "MISTAKE":
        newState.strength = Math.max(0, newState.strength - 0.2);
        newState.interference = Math.min(1, newState.interference + 0.1);
        break;
      case "FAILURE":
        newState.strength = Math.max(0, newState.strength - 0.4);
        newState.interference = Math.min(1, newState.interference + 0.2);
        break;
      default:
        throw new Error(`Invalid signal enum: ${signal.enum}`);
    }
  } else if (signal.ratio) {
    const ratio = signal.ratio.success / signal.ratio.total;
    const strengthDelta = (ratio - 0.5) * 0.3;
    newState.strength = Math.max(0, Math.min(1, newState.strength + strengthDelta));
    newState.interference = Math.max(0, Math.min(1, newState.interference - strengthDelta * 0.5));
  }

  return newState;
};

export default { initiate, schedule, strength, status, update };
