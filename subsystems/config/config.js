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
    html: {
      env: new Env(),
    },
  };
  // services: {},
  remotes = {};
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

// get json() {
//   // const path = this.path.toString() || "/";
//   // const routes = [];
//   // // console.log([...this.router.entries()].flat().map((e) => e.path));
//   // const children = this.descendants.map((child) => child.json);
//   // if (routes.length === 0 && children.length === 0) return path;
//   // return { [path]: [...routes, ...children] };
// }

// [Symbol.for("nodejs.util.inspect.custom")]() {
//   return `config ${JSON.stringify(this.json, null, 2)}`;
// }
