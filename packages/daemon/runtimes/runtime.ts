import { Daemon } from "@vivalence/types";

export default class Runtime {
  aperture = null;
  entities = null;
  emitter = null;
  services = null;
  hooks = null;

  config = {};
  modules = {};

  // get path() {
  //   // const url = {
  //   //   scope: `/runtime/${this.config.manifest.slug}`,
  //   // };
  //   return this.aperture.path;
  // }

  // domain = {};
  // strategies = {};

  constructor(config: any, daemon: Daemon) {
    this.config = config;
    this.emitter = daemon.emitter.branch();
  }
}
