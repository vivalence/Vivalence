import { Mode, Path, Vector, Aperture, shard } from "@vivalence/typology";
// import { maps } from "@vivalence/runtime";

export class Daemon {
  // slug = null;
  manifest = {}; //
  mount = new Path(); // internal root
  attach = null; // Url(runtime.latch)
  url = null; // Url() system level integration.
  aperture = new Aperture() //
    .use(shard.context.bind("daemon", this));
  connection = null;
  call = null;
  authority = null; // lighthouse client
  harness = null;
  entity = null; // ? maybe network level, thus runtime thus daemonDie. daemonDie.entity? hmm
  statics = null;
  cargo = {};
  docs = {};

  // schema = {
  //   primitives: {}, // {dimension signal} = f(domain*ontology)
  //   gestalten: {}, // {annotation symbol, literal, statics modes traits entities} = f(domain*ontology)
  //   entities: {}, // {literal symbol exercise} f(domain + system)
  //   subjects: {}, // {noun verb pronoun posessives} = f(dimensions*topographies)
  // };

  entities = {}; // f(domain.entities,system.entites)
  twitch = new Vector();

  modes = {}; // map {game:{translations: Mode},teachers:{iroh:Mode}}
  services = {}; // service providers { nlp:{analyze:(text)=>({annotations[]})} }

  // units = {}; // f(kernel.subjects*datamap.entities)

  // classify = {};
  // validate = {};
  // assert = {};

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
