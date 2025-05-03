import { Classifier, Remedy } from "@vivalence/shared";

import schema from "../../schema/index.js";
import asserterFactory from "../../locals/asserter.js";
import schematics from "./schematics.js";
import { classifierFactory } from "./classifier.js";

export default function boot(runtime) {
  const ontology = {
    annotations: new schema.repositories.annotation(),
    topographies: new schema.repositories.topography(),
    constraints: new schema.repositories.constraint(),
    issues: new schema.repositories.issue(),
    remedy: new Remedy(),
    classifier: new Classifier(),
  };

  const topologies = [
    runtime.config.modules.ontology.topology,
    ...runtime.config.modules.corpora.map((c) => c.topology),
  ];

  for (const {
    annotations = [],
    remedies = [],
    topographies = [],
    constraints = [],
    extractors = [],
  } of topologies) {
    constraints.forEach((c) => ontology.constraints.create(c));
    annotations.forEach((a) => ontology.annotations.create(a));
    topographies.forEach((t) => ontology.topographies.create(t));
    remedies.forEach((r) => ontology.remedy.register(r));
    extractors.forEach(([s, p]) => ontology.classifier.on(s, p));
  }

  if (runtime.config.modules.ontology.boot)
    runtime.config.modules.ontology.boot(ontology);

  schematics(ontology);

  ontology.assert = asserterFactory(ontology);
  ontology.classify = classifierFactory(runtime)(ontology);

  runtime.ontology = ontology;
}
