import { Env } from "@vivalence/typology/classes";

import find from "./tools/find.js";
import joins from "./tools/joins.js";
import read from "./tools/read.js";
import check from "./tools/check.js";
import state from "./tools/state.js";

export default class Config {
  env = new Env();
  system = { role: null, mode: null, variant: null, daemon: {}, clients: {} };
  runtimes = {};
  services = [];
  constructor() {
    find(this);
    joins(this);
    read(this);
    check(this);
    state(this);
  }
  map = {
    // directories = {system,data,env};
    env: {
      systems: "systems.jsonc",
      service: "service.jsonc",
      secrets: "secrets.jsonc",
      publish: "publish.jsonc",
    },
  };
}
