import { createParser } from "./parser.js";
import { split, signatures } from "./signature.js";

export const sig = createParser("sig", split, signatures);
