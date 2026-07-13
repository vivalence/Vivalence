import { time } from "@vivalence/shared";

const initiate = ({ signal = {} }) => {
  if (typeof signal === "string") signal = { enum: signal };

  if (!signal.enum && !signal.ratio) throw new Error("No signal provided to initiate memory");

  if (signal.enum) return ["MASTERY", "SUCCESS", "NEUTRAL"].includes(signal.enum);
  else return signal.ratio.success / signal.ratio.total >= 0.5;
};

const schedule = ({ memory }) => {
  const nextIn = memory.state ? 9999999 : 0;
  const nextAt = time.futureDatetime(nextIn);
  return { nextIn, nextAt };
};

const strength = ({ memory }) => {
  return memory.state ? 1 : 0;
};

const status = ({ memory }) => {
  return memory.state === true //
    ? "GRADUATED"
    : memory.state === false
      ? "UNKNOWN"
      : "UNTOUCHED";
};

const update = ({ memory, signal }) => {
  if (typeof signal === "string") signal = { enum: signal };
  if (!signal.enum && !signal.ratio) throw new Error("No valid signal provided to update memory");

  if (signal.enum) return ["MASTERY", "SUCCESS", "NEUTRAL"].includes(signal.enum);
  else return signal.ratio.success / signal.ratio.total >= 0.3;
};

export default { initiate, schedule, strength, status, update };
