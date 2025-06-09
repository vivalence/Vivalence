import { ValenceRepository } from "@vivalence/entities";
import { Daemon } from "@vivalence/types";

export default class Runtime {
  statics = {};
  config = {};
  modules = {};

  aperture = null;
  entities = null;
  services = null;

  emitter = null;
  hooks = null;

  schema = {};
  valences = new ValenceRepository();

  constructor(config: any, daemon: Daemon) {
    this.config = config;
    this.statics = config.statics;
    this.emitter = daemon.emitter.branch();
    // aperture ?
  }
}
