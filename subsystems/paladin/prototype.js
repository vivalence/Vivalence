import { Env } from "@vivalence/typology";

import find from "./tools/find.js";
import join from "./tools/join.js";
import read from "./tools/read.js";
import check from "./tools/check.js";
import state from "./tools/state.js";

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

  clients = []; // { slug: "html", config: null }
  runtimes = [];
  services = [];
  // processes
  service = {}; // {slug:service}
  // runtime = {};
  // client = {};

  constructor() {
    read(this);
    find(this);
    check(this);
    state(this);
    join(this);
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
//   return `paladin ${JSON.stringify(this.json, null, 2)}`;
// }
