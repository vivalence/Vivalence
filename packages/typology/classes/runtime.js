import { Vector } from "@vivalence/vector";

export class Runtime {
  // construct
  // constructor(config) {this.config = config; this.manifest = config.manifest; this.statics = config.statics;}
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
    //   remedy: new Remedy(), classifier: new Classifier(), dimension: new DimensionRepository(), topography: new TopographyRepository(), constraint: new ConstraintRepository(), issue: new IssueRepository(),
  };

  // resolve
  services = {};
  modules = {}; // clients
  entities = null; //
  schema = {};

  // integrate
  // -
}
