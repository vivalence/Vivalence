import { Remedy, Mode, Path } from "@vivalence/typology";
import { Vector, shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
// import { maps as entities } from "@vivalence/entities";

export class Runtime {
  slug = null; //
  cake = { manifest: {} }; //
  gaia = null; // gaia client
  tilde = new Path(); // internal root
  aperture = new Aperture();
  call = null;

  kernel = {
    orm: {},
    schema: {
      primitives: {}, // {dimension signal} = f(domain*ontology)
      gestalten: {}, // {annotation symbol, literal, statics modes traits entities} = f(domain*ontology)
      units: {}, // {noun verb pronoun posessives} = f(dimensions*topographies)
      entities: {}, // {literal symbol exercise} f(domain + system)
    },
    medic: new Remedy(),
    taxonomist: new Vector(),
    // dimension: new maps.ontology.dimension.repository(),
    // subject: new maps.ontology.subject.repository(),
    // constraint: new entities.ontology.constraint.repository(),
    // issue: new entities.ontology.issue.repository(),
    // predicate: new Vector(),
  };

  mode = {}; // map {game:{translations: Mode},teachers:{iroh:Mode}}
  service = {}; // service providers { nlp:{analyze:(text)=>({annotations[]})} }
  entities = { em: {} }; // f(domain.entities,system.entites)
  subjects = {}; // f(topographies*entities)

  twitch = new Vector();
  classify = {};
  validate = {};
  assert = {};

  constructor(cake) {
    this.cake = cake;
    this.slug = cake.manifest.slug;
    this.traits = cake.manifest.traits || [];
    this.statics = cake?.statics || {};

    this.aperture
      .use(shards.context.attach("runtime", this))
      .open("/status", async () => ({ code: "SUCCESS" }))
      .open("/manifest", async () => ({ ...this.cake.manifest }));
  }
}
