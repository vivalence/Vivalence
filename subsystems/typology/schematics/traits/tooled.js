import { v } from "../v.js";

export const Load = v.enum(["eager", "lazy", "none"]);
export const Tooled = v.record(v.string(), Load);
