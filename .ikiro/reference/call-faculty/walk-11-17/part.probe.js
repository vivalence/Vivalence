import { v } from "@vivalence/typology";
const { Part } = v.primitives.hallucination;
console.log([...Part.Any.errors({ type: "text", text: "vado ", draft: "al mer" })].length ? "INVALID" : "valid");
