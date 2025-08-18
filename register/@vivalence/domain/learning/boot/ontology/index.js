import { Classifier, Remedy } from "@vivalence/shared";
import factories from "./factories/index.js";

export default async function boot(register, runtime) {
  const ontology = {
    // dimension: new data.ontology.dimension(), topography: new data.ontology.topography(), constraint: new data.ontology.constraint(), issue: new data.ontology.issue(),
    ...runtime.domain.data,

    remedy: new Remedy(),
    classifier: new Classifier(),
    // predicate: new Vector(),
  };

  const topic = [register.ontology.topology, ...register.topic];

  for (const {
    dimension = [],
    topography = [],
    constraint = [],
    // predicate = [],
    remedy = [],
    receptor = [],
  } of topic) {
    dimensions.forEach((a) => ontology.dimension.create(a));
    constraints.forEach((c) => ontology.constraint.create(c));
    topographies.forEach((t) => ontology.topography.create(t));

    remedies.forEach((r) => ontology.remedy.register(r));
    // predicate.forEach((r) => ontology.remedy.register(r));
    // receptor.entries().forEach(([form, parsers]) => {
    //   parsers.map((parser) => ontology.classifier.on(form, parser));
    // });
  }

  runtime.ontology = ontology;
  factories.reduce((r, f) => f(r), runtime);

  return runtime;
}

// if (runtime.config.modules.ontology.boot) runtime.config.modules.ontology.boot(ontology);
