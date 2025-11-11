import { Env } from "@vivalence/typology";
import tools from "../tools/index.js";

export class Paladin {
  traits = [];
  role = null; // client runtime 'daemon service process
  mode = null; // development production
  env = new Env();
  secret = new Env();

  variant = {
    circuits: [], // finished masks; compiled from circuits
    runtime: {},
    clients: {},
    daemons: [],
    services: [],
  };

  constructor() {
    tools.read(this);
    tools.find(this);
    tools.check(this);
    tools.state(this);
    tools.join(this);
    tools.is(this);
    tools.scope(this);
  }
}
