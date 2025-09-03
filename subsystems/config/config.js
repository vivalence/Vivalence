import { Env } from "@vivalence/typology/prototypes";

import find from "./tools/find.js";
import joins from "./tools/joins.js";
import read from "./tools/read.js";
import check from "./tools/check.js";
import state from "./tools/state.js";

export default class Config {
  env = new Env();
  registry = { register: null };

  role = null; // client daemon service runtime
  mode = null; // development production
  variant = null; // custom || f(role,mode)

  daemon = {
    env: new Env(),
  };
  clients = {
    web: {
      env: new Env(),
    },
  };
  // services: {},
  remote = {};
  runtimes = new Set();
  services = new Set();
  // processes = new Set();
  constructor() {
    find(this);
    joins(this);
    read(this);
    check(this);
    state(this);
  }
}
