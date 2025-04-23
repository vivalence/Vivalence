export default class Runtime {
  aperture = null;
  entities = null;
  emitter = null;
  services = null;
  hooks = null;
  config = {};
  // domain = {};
  // services = {};
  // //modules
  // domain = null;
  // ontology = null;
  // corpora = null;
  // games = null;
  // tactics = null;
  // // strategies = null;
  constructor(config: any) {
    this.config = config;
  }
}
