import { Classifier, Remedy, fn } from "@vivalence/shared";

import entities from "../../../entities/index.js";

import factories from "./factories/index.js";

export default async function boot(runtime) {
  const ontology = {
    dimensions: new entities.repositories.dimension(),
    topographies: new entities.repositories.topography(),
    constraints: new entities.repositories.constraint(),
    issues: new entities.repositories.issue(),
    remedy: new Remedy(),
    classifier: new Classifier(),
  };
  runtime.ontology = ontology;

  const topologies = [
    runtime.config.modules.ontology.topology,
    ...runtime.config.modules.corpora.map((c) => c.topology),
  ];

  for (const {
    dimensions = [],
    remedies = [],
    topographies = [],
    constraints = [],
    extractors = new Map(),
  } of topologies) {
    dimensions.forEach((a) => ontology.dimensions.create(a));
    topographies.forEach((t) => ontology.topographies.create(t));
    constraints.forEach((c) => ontology.constraints.create(c));
    remedies.forEach((r) => ontology.remedy.register(r));

    extractors.entries().forEach(([form, parsers]) => {
      parsers.map((parser) => ontology.classifier.on(form, parser));
    });
  }

  if (runtime.config.modules.ontology.boot)
    runtime.config.modules.ontology.boot(ontology);

  factories.reduce((r, f) => f(r), runtime);

  return runtime;
}
