import { Vector } from "@vivalence/typology";
import * as instance from "./instance/index.js";
import * as ledger from "./ledger/index.js";
import * as registry from "./registry/index.js";

export const paladin = new Vector().graft(ledger.ledger, registry.registry, instance.instance);
export const reports = new Vector().graft(ledger.doctor, registry.doctor, instance.doctor);
export const records = new Vector().graft(registry.tap, registry.untap, instance.clone, instance.tap, instance.use, instance.rename, instance.remove, instance.cleanup, ledger.cleanup);
