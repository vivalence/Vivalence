import { v } from "@vivalence/typology";

// what the runtime consumes: paladin's Instance, judged by paladin at settle (Path() and Url() are codecs — a settled
// instance is DECODED, and a schematic judges the wire form), plus the one slot paladin leaves optional: runtime.
export const Instance = v.object({ runtime: v.object({}, { additionalProperties: true }) }, { additionalProperties: true });
