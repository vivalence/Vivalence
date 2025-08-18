import { Classifier, Remedy } from "@vivalence/shared";
import { maps } from "@vivalence/entities";
import { Vector, mw } from "@vivalence/vector";
import { Aperture, Path } from "@vivalence/vector/aperture";

export class Runtime {
  // construct
  withConfig(config) {
    // this.config = config;
    this.config = { manifest: config.manifest };
    this.slug = config.manifest.slug;
    this.statics = config.statics;
    // tools.x(this)
    return this;
  }
  aperture = new Aperture().use(mw.identity("runtime", this));
  twitch = new Vector();

  // populate
  domain = {
    modulemap: {},
    datamap: {},
  };
  // maps = {module: {}, data: {}, service: {},};
  ontology = {
    medic: new Remedy(),
    taxonomist: new Classifier(),

    dimension: new maps.ontology.dimension.repository(),
    topography: new maps.ontology.topography.repository(),
    constraint: new maps.ontology.constraint.repository(),
    issue: new maps.ontology.issue.repository(),

    // predicate: new Vector(),
  };

  // resolve
  services = {}; // clients {database identity brain wallet}
  modules = {}; // clients {game agent strategy tactic} !datasets dont need clients.!
  entities = null; // {...datamap.repositories}
  schema = {
    primitives: {}, // {annotation dimension signal statics} = f(domain*ontology)
    annotations: {}, // {noun verb pronoun posessives} = f(dimensions*topographies)
    entities: {}, // {literal symbol exercise} f(domain + system)
    // modules: {}, // ?by module, trait, interface, or other?
  };

  // integrate
  classify = null;
  validate = {};
  assert = {};
  call = null;
  // -
}

// runtime map entry
// { instance, config, services, status, prototype }
// { slug instance, config, services, status, prototype }
