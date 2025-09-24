import { Classifier, Remedy } from "@vivalence/shared";
import { Vector, shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
import { maps } from "@vivalence/entities";

export class Runtime {
  constructor(config) {
    this.config = { ...config };
    this.slug = config.manifest.slug;
    this.traits = config.manifest.traits || [];
    this.statics = config?.statics || {};
  }

  twitch = new Vector();
  aperture = new Aperture()
    .use(shards.context.attach("runtime", this))
    .open("/status", async () => ({ code: "SUCCESS" }))
    .open("/manifest", async () => ({ ...this.config.manifest }));

  ontology = {
    medic: new Remedy(),
    taxonomist: new Classifier(),

    dimension: new maps.ontology.dimension.repository(),
    topography: new maps.ontology.topography.repository(),
    constraint: new maps.ontology.constraint.repository(),
    issue: new maps.ontology.issue.repository(),

    // predicate: new Vector(),
  };

  service = {}; // clientmap {database identity brain wallet}
  module = {}; // map
  // modules = {}; // repositories of instances {game agent strategy tactic} !datasets dont need clients.!
  entities = { orm: {}, em: {} }; // {...datamap.repositories}
  schema = {
    primitives: {}, // {dimension signal} = f(domain*ontology)
    gestalten: {}, // {annotation statics modules traits entities} = f(domain*ontology)
    annotations: {}, // {noun verb pronoun posessives} = f(dimensions*topographies)
    entities: {}, // {literal symbol exercise} f(domain + system)
  };

  classify = null;
  validate = {};
  assert = {};
  call = null;
  // -
}
