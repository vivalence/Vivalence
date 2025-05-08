import { ValenceRepository } from "@vivalence/schema";
import { Daemon } from "@vivalence/types";

export default class Runtime {
  config = {};
  modules = {};

  aperture = null;
  entities = null;
  services = null;

  emitter = null;
  hooks = null;

  ontology = {};
  valences = new ValenceRepository();

  // domain = {};
  // strategies = {};

  constructor(config: any, daemon: Daemon) {
    this.config = config;
    this.emitter = daemon.emitter.branch();
    // aperture ?
  }
}
