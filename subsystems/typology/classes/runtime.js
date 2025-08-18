import { Classifier, Remedy } from "@vivalence/shared";
import { Vector } from "@vivalence/vector";

export class Runtime {
  // construct
  constructor(config) {
    this.config = config;
    // tools.x(this)
  }
  aperture = null;
  twitch = new Vector();

  // populate
  config = null;
  manifest = null;
  statics = null;
  domain = {
    register: {}, // register
    datamap: {}, // datamap
  };
  ontology = {
    curator: new Remedy(),
    taxonomist: new Classifier(),

    // dimension: new DimensionRepository(),
    // topography: new TopographyRepository(),
    // constraint: new ConstraintRepository(),
    // issue: new IssueRepository(),
  };

  // resolve
  services = {}; // clients {database identity brain wallet}
  modules = {}; // clients {game agent strategy tactic} !datasets dont need clients.!
  entities = null; // {...datamap.repositories}
  schema = {
    annotations: {}, // {noun verb pronoun posessives} = f(dimensions*topographies)
    primitives: {}, // {annotation dimension signal statics} = f(domain*ontology)
    entities: {}, // {unit symbol exercise} f(domain + system)
    modules: {}, // ?by module, trait, interface, or other?
  };

  // integrate
  classify = null;
  validate = null;
  assert = null;
  // -
}

// runtime map entry
// { instance, config, services, status, register }
// { slug instance, config, services, status, register }
