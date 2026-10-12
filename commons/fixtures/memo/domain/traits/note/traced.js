import { traits, v } from "@vivalence/typology";
import { SIGNAL, STATUS } from "../../types.js";

export const TRACED = traits.define("TRACED", {
  schematic: v.object({
    signal: v.enum(SIGNAL),
    status: v.enum(STATUS),
    snapshot: v.object({}, { additionalProperties: true }).default({}),
    mode: v.union([v.string(), v.null()]).default(null),
    thread: v.union([v.string(), v.null()]).default(null),
  }),
});
