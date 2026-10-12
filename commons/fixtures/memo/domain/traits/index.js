import { RETAINED as retained } from "./note/retained.js";
import { TRACED } from "./note/traced.js";
import { SUSPENDED } from "./note/suspended.js";
import { RETAINED } from "./literal/retained.js";
import { DEPICTED, EXEMPLIFIED, RANKED, TRANSLATED, VOCALIZED } from "./literal/claims.js";

export const literal = [RETAINED, TRANSLATED, EXEMPLIFIED, RANKED, VOCALIZED, DEPICTED];
export const symbol = [];
export const note = [retained, TRACED, SUSPENDED];
