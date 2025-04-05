export default class Runtime {
  aperture = null;
  entities = null;
  emitter = null;
  services = null;
  //self
  Module = {};
  entity = null;
  //
  Modules = {};
  //modules
  domain = null;
  ontology = null;
  corpora = null;
  games = null;
  tactics = null;
  // strategies = null;
  constructor(Modules: any) {
    this.Modules = Modules;
  }
}
