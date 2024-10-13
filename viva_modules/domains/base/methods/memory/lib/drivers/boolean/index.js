// MASTERY +10
// SUCCESS  +1
// NEUTRAL   0
// MISTAKE  -1
// FAILURE -10

const initiate = (signal) => {
  if (!signal || (!signal.enum && !signal.ratio))
    throw new Error("No signal provided to initiate memory");

  if (signal.enum) return ["MASTERY", "SUCCESS", "NEUTRAL"].includes(signal.enum);
  else return signal.ratio.success / signal.ratio.total >= 0.5;
};

const schedule = ({ state }) => {
  const nextIn = state ? 99999999 : 0;
  const nextAt = time.futureDatetime(nextIn);
  return { nextIn, nextAt };
};

const strength = ({ state }) => {
  return state ? 1 : 0;
};

const status = ({ state, nextIn, history }) => {
  return state === true ? "GRADUATED" : state === false ? "UNKNOWN" : "UNTOUCHED";
};

const update = (memory, signal) => {
  if (!signal || (!signal.enum && !signal.ratio))
    throw new Error("No valid signal provided to update memory");

  if (signal.enum) return ["MASTERY", "SUCCESS", "NEUTRAL"].includes(signal.enum);
  else return signal.ratio.success / signal.ratio.total >= 0.3;
};

export default { initiate, schedule, strength, status, update };
