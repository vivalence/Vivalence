import { Env } from "@vivalence/typology";
import belt from "../belt/index.js";

export class Paladin {
  traits = [];
  env = new Env();
  secret = new Env();

  variant = {
    // circuitry: [], // backup: pre-M1 variant quest
    runtime: {},
    clients: {},
    daemons: [],
    services: [],
  };

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
