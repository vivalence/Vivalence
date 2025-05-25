import { ValenceRepository } from "@vivalence/entities";
import { Daemon } from "@vivalence/types";

export default class Runtime {
  config = {};
  modules = {};

  aperture = null;
  entities = null;
  services = null;

  emitter = null;
  hooks = null;

  schema = {};
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
