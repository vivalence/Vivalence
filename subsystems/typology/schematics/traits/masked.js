import { v } from "../v.js";

export const Masked = v.object({}, { additionalProperties: true }).desc('Fields merged into every pull of the thread. Example: { "level": "a1" }');
