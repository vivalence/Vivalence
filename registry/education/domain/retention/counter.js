import { time } from "@vivalence/typology";

const POSITIVE = ["MASTERY", "SUCCESS", "NEUTRAL"];

const SCHEDULE = [1, 1, 24, 24, 24, 168, 168, 168];

const assess = ({ state }) => {
  if (!state) return { status: "UNTOUCHED", nextIn: 0, nextAt: time.futureDatetime(0) };

  const s = state.streak;
  const nextIn = s >= SCHEDULE.length ? 9999999 : SCHEDULE[s];
  const nextAt = time.futureDatetime(nextIn);
  const status = s >= 8
    ? "GRADUATED"
    : s >= 5
      ? "KNOWN"
      : s >= 2
        ? "LEARNING"
        : "UNKNOWN";
  return { status, nextIn, nextAt };
};

const encode = (signal) => {
  if (!signal.enum) throw new Error("Counter driver requires signal.enum");
  const hit = POSITIVE.includes(signal.enum);
  const state = {
    streak: hit ? 1 : 0,
    total: 1,
    successes: hit ? 1 : 0,
  };
  return { state, ...assess({ state }) };
};

const evolve = (signal, retention) => {
  if (!signal.enum) throw new Error("Counter driver requires signal.enum");
  const hit = POSITIVE.includes(signal.enum);
  const prev = retention.state;
  const state = {
    streak: hit ? (prev.streak || 0) + 1 : 0,
    total: (prev.total || 0) + 1,
    successes: (prev.successes || 0) + (hit ? 1 : 0),
  };
  return { state, ...assess({ state }) };
};

export default {
  type: "COUNTER",
  encode,
  evolve,
  assess,
  sql: {
    strength: (table) =>
      `MIN(json_extract(${table}.state, '$.streak') * 1.0 / 8.0, 1.0)`,
  },
};
