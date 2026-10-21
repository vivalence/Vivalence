import { Vector } from "@vivalence/typology";
import { cleanup } from "./cleanup.js";
import { doctor } from "./doctor.js";
import { install } from "./install.js";

export const ledger = new Vector().graft(install, doctor, cleanup);
