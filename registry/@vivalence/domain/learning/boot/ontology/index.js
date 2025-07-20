import { Classifier, Remedy, fn } from "@vivalence/shared";
import factories from "./factories/index.js";

export default async function boot(runtime) {
  const data = runtime.domain.data;

  const ontology = {
    // dimension: new data.ontology.dimension(), topography: new data.ontology.topography(), constraint: new data.ontology.constraint(), issue: new data.ontology.issue(),
    ...data.ontology,

    remedy: new Remedy(),
    classifier: new Classifier(),
  };

  runtime.ontology = ontology;
  //

  const topologies = [
    runtime.register.modules.ontology.topology,
    ...runtime.register.modules.corpora.map((c) => c.topology),
  ];

  for (const {
    dimensions = [],
    remedies = [],
    topographies = [],
    constraints = [],
    extractors = new Map(),
  } of topologies) {
    dimensions.forEach((a) => ontology.dimension.create(a));
    topographies.forEach((t) => ontology.topography.create(t));
    constraints.forEach((c) => ontology.constraint.create(c));

    remedies.forEach((r) => ontology.remedy.register(r));
    extractors.entries().forEach(([form, parsers]) => {
      parsers.map((parser) => ontology.classifier.on(form, parser));
    });
  }

  factories.reduce((r, f) => f(r), runtime);

  return runtime;
}

// if (runtime.config.modules.ontology.boot) runtime.config.modules.ontology.boot(ontology);
