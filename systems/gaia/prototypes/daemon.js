import { Remedy, Mode, Path } from "@vivalence/typology";
import { Vector, shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";
// import { maps as entities } from "@vivalence/entities";

export class Daemon {
  slug = null; //
  cake = { manifest: {} }; //
  authority = null; // lighthouse client
  mount = new Path(); // internal root
  aperture = new Aperture();
  call = null;

  kernel = {
    orm: {},
    medic: new Remedy(),
    taxonomist: new Vector(),
    // dimension: new maps.ontology.dimension.repository(),
    // subject: new maps.ontology.subject.repository(),
    // constraint: new entities.ontology.constraint.repository(),
    // issue: new entities.ontology.issue.repository(),
    // predicate: new Vector(),
  };

  schema = {
    primitives: {}, // {dimension signal} = f(domain*ontology)
    gestalten: {}, // {annotation symbol, literal, statics modes traits entities} = f(domain*ontology)
    entities: {}, // {literal symbol exercise} f(domain + system)
    subjects: {}, // {noun verb pronoun posessives} = f(dimensions*topographies)
  };
  entities = { em: {} }; // f(domain.entities,system.entites)
  modes = {}; // map {game:{translations: Mode},teachers:{iroh:Mode}}
  services = {}; // service providers { nlp:{analyze:(text)=>({annotations[]})} }
  subjects = {}; // f(kernel.subjects*datamap.entities)

  twitch = new Vector();
  classify = {};
  validate = {};
  assert = {};

  constructor(cake) {
    this.cake = cake;
    this.slug = cake.manifest.slug;
    this.traits = cake.manifest.traits || [];
    this.statics = cake?.statics || {};

    // this.aperture
    //   .use(shards.context.attach("daemon", this))
    //   .use(shards.context.attach("runtime", this))
    //   .open("/status", async () => ({ code: "SUCCESS" }))
    //   .open("/manifest", async () => ({ ...this.cake.manifest }));
  }
}
