// maybe to types/classes
// traits instantiated
export default class Runtime {
  statics = {};
  manifest = {};
  config = {};
  modules = {};

  aperture = null;
  entities = null;
  services = null;

  emitter = null;
  hooks = null;

  schema = {};

  constructor(config: any) {
    this.config = config;
    this.manifest = config.manifest;
    this.statics = config.statics;
  }
}
