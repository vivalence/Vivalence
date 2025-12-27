import { Remedy, Mode, Path } from "@vivalence/typology";
import { Vector, shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

export class Daemon {
  // slug = null;
  manifest = {}; //
  mount = new Path(); // internal root
  attach = null; // Url(runtime.latch)
  url = null; // Url() system level integration.
  aperture = new Aperture();
  call = null;
  authority = null; // lighthouse client
  entity = null; // ? maybe network level, thus runtime thus daemonDie. daemonDie.entity? hmm

  kernel = {
    orm: {},
    em: {},
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

  entities = {}; // f(domain.entities,system.entites)
  modes = {}; // map {game:{translations: Mode},teachers:{iroh:Mode}}
  services = {}; // service providers { nlp:{analyze:(text)=>({annotations[]})} }
  units = {}; // f(kernel.subjects*datamap.entities)

  twitch = new Vector();
  classify = {};
  validate = {};
  assert = {};

  constructor(circuit) {
    Object.assign(this, circuit);

    // // this.mask = mask;
    // this.slug = mask.manifest.slug;
    // this.statics = mask?.statics || {};

    // this.aperture
    //   .use(shards.context.attach("daemon", this))
    //   .use(shards.context.attach("runtime", this))
    //   .open("/status", async () => ({ code: "SUCCESS" }))
    //   .open("/manifest", async () => ({ ...this.mask.manifest }));
  }
  get traits() {
    // tbd reactive at runtime
    return this.manifest.traits || [];
  }
}
