export default class Runtime {
  Module = {};
  entity = null;
  Modules = {};
  entities = null;
  aperture = null;
  emitter = null;
  services = null;
  domain = null;
  ontology = null;
  curricula = null;
  games = null;
  tactics = null;
  // strategies = null;
  constructor(Modules: any) {
    this.Modules = Modules;
  }
}
