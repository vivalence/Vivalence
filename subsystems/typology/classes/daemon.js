import { Vector } from "@vivalence/vector";

export class Daemon {
  // construct
  aperture = null;
  twitch = new Vector();
  // constructor(process) {this.process = process;}
  // preflight
  process = null;

  // populate
  register = new Map();
  registry = null;

  // resolve
  services = new Set();
  runtimes = new Set();
  // { slug instance, config, services, status, register }

  // integrate
  server = null;
}
