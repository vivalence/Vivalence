import {
  AnnotationRepository,
  TopographyRepository,
  ConstraintRepository,
  IssueRepository,
} from "@vivalence/schema";

import aperture from "./aperture/boot.js";
import curriculum from "./curriculum/index.js";
import topology from "./topology/index.js";
import asserter from "./locals/asserter.js";
import RemedySystem from "./locals/remedy/index.ts";

class ClassifierSystem {}

async function boot(runtime) {
  let ontology = {
    // @lj entities are in memory.
    annotations: new AnnotationRepository(),
    topographies: new TopographyRepository(),
    constraints: new ConstraintRepository(),
    issues: new IssueRepository(),
    remedy: new RemedySystem(),
    classifier: new ClassifierSystem(),
  };

  ontology = [
    topology,
    ...runtime.Modules.Curricula.map((C) => C.topology),
    topology.computeSchematics,
  ].reduce((ontology, topology) => topology(ontology), ontology);

  ontology.assert = asserter(ontology);

  await routes.boot(runtime);

  return ontology;
}

const manifest = {
  type: "ontology",
  slug: "language",
  name: "Langauge after Universal Dependencies",
  version: "0.0.8",
};

export { manifest, boot, curriculum };
