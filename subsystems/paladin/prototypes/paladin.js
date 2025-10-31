import { Env } from "@vivalence/typology";
import tools from "../tools/index.js";

export class Paladin {
  traits = [];
  role = null; // client daemon service runtime
  mode = null; // development production
  env = new Env();
  secret = new Env();

  scope = { variant: {}, registry: {}, system: {}, tilde: {} }; // @each .mount = Path(some)

  variant = {
    circuits: [], // finished cakes; compiled from circuits
    gaia: {},
    lighthouse: {},
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
  }
}
