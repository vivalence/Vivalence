import { Vector } from "@vivalence/typology";
import { instance } from "./instance/index.js";
import { ledger } from "./ledger/index.js";
import { registry } from "./registry/index.js";

export const commands = new Vector().graft(ledger, registry, instance);
