import { Vector } from "@vivalence/typology";
import { doctor } from "./doctor.js";
import { tap } from "./tap.js";
import { untap } from "./untap.js";

export const registry = new Vector().graft(doctor, tap, untap);
