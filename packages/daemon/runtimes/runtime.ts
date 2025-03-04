export default class Runtime {
  Modules = {};
  entity = null;
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
