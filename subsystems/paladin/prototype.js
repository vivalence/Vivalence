import { Env } from "@vivalence/typology";

import find from "./tools/find.js";
import join from "./tools/join.js";
import read from "./tools/read.js";
import check from "./tools/check.js";
import state from "./tools/state.js";
import bake from "./tools/bake.js";

export class Paladin {
  variant = null; // type | slug
  traits = [];
  role = null; // client daemon service runtime
  mode = null; // development production
  env = new Env();
  secret = new Env();

  tilde = { mount: null };
  system = { mount: null };
  vip = { mount: null };

  gaia = { serve: null };
  daemon = { serve: null };
  runtimes = []; // config
  services = []; // config
  clients = []; // config
  // processes

  service = {}; // cake {slug:service}
  runtime = {}; // cake
  client = {}; // cake

  constructor() {
    read(this);
    find(this);
    check(this);
    state(this);
    join(this);
    bake(this);
  }
}
