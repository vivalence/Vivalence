import { Classifier, Remedy } from "@vivalence/shared";

import entities from "../../../entities/index.js";

import classifierFactory from "./classifier.js";
import asserterFactory from "./asserter.js";
import schematics from "./schematics.js";

export default function boot(runtime) {
  const ontology = {
    dimensions: new entities.repositories.dimension(),
    topographies: new entities.repositories.topography(),
    constraints: new entities.repositories.constraint(),
    issues: new entities.repositories.issue(),
    remedy: new Remedy(),
    classifier: new Classifier(),
    schema: {},
  };

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
    constraints.forEach((c) => ontology.constraints.create(c));
    dimensions.forEach((a) => ontology.dimensions.create(a));
    topographies.forEach((t) => ontology.topographies.create(t));
    remedies.forEach((r) => ontology.remedy.register(r));

    extractors.entries().forEach(([form, parsers]) => {
      parsers.map((parser) => ontology.classifier.on(form, parser));
    });
  }

  if (runtime.config.modules.ontology.boot)
    runtime.config.modules.ontology.boot(ontology);

  ontology.schema = schematics(runtime)(ontology);
  ontology.assert = asserterFactory(runtime)(ontology);
  ontology.classify = classifierFactory(runtime)(ontology);

  runtime.ontology = ontology;
}
