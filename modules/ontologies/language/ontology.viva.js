// import {
//   AnnotationRepository,
//   TopographyRepository,
//   ConstraintRepository,
//   IssueRepository,
// } from "@vivalence/schema";

// import aperture from "./aperture/index.js";
import curriculum from "./curriculum/index.js";
import topology from "./topology/index.js";
// import asserter from "./locals/asserter.js";
// import Remedy from "./locals/remedy/index.ts";
// import Classifier from "./locals/classifier/index.js";

async function boot(runtime) {
  // const domain = runtime.config.domain
  // let ontology = {
  //   // annotations: new domain.schema.repos.Annotation(),
  //   // topographies: new domain.schema.repos.Topography(),
  //   // constraints: new domain.schema.repos.Constraint(),
  //   // issues: new domain.schema.repos.Issue(),
  //   remedy: new Remedy(),
  //   classifier: new Classifier(),
  // };
  // ontology = [
  //   topology,
  //   ...runtime.modules.Corpora.map((C) => C.topology),
  //   topology.computeSchematics,
  // ].reduce((ontology, topology) => topology(ontology), ontology);
  // ontology.assert = asserter(ontology);
  // ontology.classify = ontology.classifier.build();
  // return new domain.modules.ontology(ontology);
}

const manifest = {
  type: "ontology",
  slug: "language",
  name: "Langauge after Universal Dependencies",
  version: "0.0.8",
};

export { manifest, boot, topology, curriculum };
