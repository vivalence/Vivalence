import { Vector } from "@vivalence/vector";

export class Daemon {
  process = null;

  register = new Map();
  registry = null;

  services = new Set();
  runtimes = new Map();

  aperture = null;
  twitch = new Vector();
  server = null;

  // constructor(process) {this.process = process;}
}
