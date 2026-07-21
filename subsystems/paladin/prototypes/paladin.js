import { Env } from "@vivalence/typology";
import belt from "../belt/index.js";
import { Ledger } from "./ledger/index.js";
import { Variant } from "./variant.js";
import { Vip } from "./vip.js";

export class Paladin {
  traits = [];
  env = new Env();
  secret = new Env();

  constructor() {
    // deprecated
    // belt.join(this);
    // belt
    belt.read(this);
    belt.find(this);
    belt.check(this);
    belt.state(this);
    // resolution
    belt.is(this);
    belt.scope(this);
    belt.publish(this);
    belt.source(this);
    belt.bundler(this);
    // mountables — siblings of vip, own their state, fn.once mount()
    this.ledger = new Ledger(this);
    this.variant = new Variant(this);
    this.vip = new Vip(this);
  }

  get role() {
    // role = string; // client runtime 'daemon service process
    return this.env.get("VIVA_SYSTEM_ROLE");
  }
  get mode() {
    // mode = string; // development production
    return this.env.get("VIVA_SYSTEM_MODE");
  }
}
