import { Env } from "@vivalence/typology";
import tools from "../tools/index.js";

export class Paladin {
  traits = [];
  env = new Env();
  secret = new Env();

  variant = {
    circuitry: [], // finished masks; compiled from circuitry
    runtime: {},
    clients: {},
    daemons: [],
    services: [],
  };

  constructor() {
    // deprecated
    tools.join(this);
    // belt
    tools.read(this);
    tools.find(this);
    tools.check(this);
    tools.state(this);
    // resolution
    tools.is(this);
    tools.scope(this);
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
