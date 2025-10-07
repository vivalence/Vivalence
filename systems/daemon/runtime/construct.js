import { Remedy, Module } from "@vivalence/typology";
import { Vector, shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
import { userspace, system, ontology } from "@vivalence/entities/maps";
import { traitmap } from "./module/traitmap.js";

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
    taxonomist: new Vector(),

    // dimension: new maps.ontology.dimension.repository(),
    // topography: new maps.ontology.topography.repository(),
    constraint: new ontology.constraint.repository(),
    issue: new ontology.issue.repository(),

    // predicate: new Vector(),
  };

  service = {}; // clientmap {database identity brain wallet}
  module = {}; // map
  entities = { orm: {}, em: {} }; // {...datamap.repositories}
  schema = {
    primitives: {}, // {dimension signal} = f(domain*ontology)
    gestalten: {}, // {annotation statics modules traits entities} = f(domain*ontology)
    units: {}, // {noun verb pronoun posessives} = f(dimensions*topographies)
    entities: {}, // {literal symbol exercise} f(domain + system)
  };

  classify = null;
  validate = {};
  assert = {};
  call = null;
  // -
}

export function maps(rme) {
  rme.maps.modules = {
    // defaults? ...typology.maps.modules
    ontology: { prototype: Module },
    domain: { prototype: Module },
    topic: { prototype: Module },
    ...(rme.register.modules.domain.maps.modules || {}),
  };

  rme.maps.traits = {
    ...traitmap,
    ...(rme.register.modules.domain.maps.traits || {}),
  };

  rme.maps.entities = {
    valence: system.valence,
    module: system.module,
    dimension: ontology.dimension,
    topography: ontology.topography,
    // ...maps.ontology,
    ...userspace,
    ...rme.register.modules.domain.maps.entities,
    // ...maps.ontology,
  };
}
