import { v } from "../v.js";

export const Condition = v.enum(["NOMINAL", "EXHAUSTED", "ERROR"]);

export const Yield = v.object(
  {
    condition: Condition,
    output: v.object({ buffer: v.array(v.object({}, { additionalProperties: true })) }, { additionalProperties: true }),
    error: v.unknown().optional(),
  },
  { additionalProperties: true },
);
