import { time } from "@vivalence/typology";

const POSITIVE = ["MASTERY", "SUCCESS", "NEUTRAL"];

const assess = ({ state }) => {
  const nextIn = state ? 9999999 : 0;
  const nextAt = time.futureDatetime(nextIn);
  const status = state === true
    ? "GRADUATED"
    : state === false
      ? "UNKNOWN"
      : "UNTOUCHED";
  return { status, nextIn, nextAt };
};

const encode = (signal) => {
  let state;
  if (signal.enum) {
    state = POSITIVE.includes(signal.enum);
  } else if (signal.ratio) {
    state = signal.ratio.success / signal.ratio.total >= 0.5;
  } else {
    throw new Error("No signal provided to encode memory");
  }
  return { state, ...assess({ state }) };
};

const evolve = (signal, memory) => {
  let state;
  if (signal.enum) {
    state = POSITIVE.includes(signal.enum);
  } else if (signal.ratio) {
    state = signal.ratio.success / signal.ratio.total >= 0.3;
  } else {
    throw new Error("No signal provided to evolve memory");
  }
  return { state, ...assess({ state }) };
};

export default {
  type: "BOOLEAN",
  encode,
  evolve,
  assess,
  sql: {
    strength: (table) =>
      `CASE WHEN json_extract(${table}.state, '$') = 1 THEN 1.0 ELSE 0.0 END`,
  },
};
