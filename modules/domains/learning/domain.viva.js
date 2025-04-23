import { DomainEntity } from "@vivalence/schema";
import hooks from "./hooks/index.js";
import schema from "./schema/index.js";
import events from "./events/index.js";
import aperture from "./aperture/index.js";

function boot(runtime) {
  aperture.boot(runtime);
  events.boot(runtime);

  // ?? return domain?

  runtime.ontology = {
    annotations: new schema.repos.Annotation(),
    topographies: new schema.repos.Topography(),
    constraints: new schema.repos.Constraint(),
    issues: new schema.repos.Issue(),

    remedy: new Remedy(),
    classifier: new Classifier(),
  };

  // return runtime;
  // return new DomainEntity();
}

function install() {
  runtime.ontology = [
    runtime.modules.ontology.topology,
    ...runtime.modules.corpora.map((C) => C.topology),
    topology.computeSchematics,
  ].reduce((o, t) => t(o), runtime.ontology);

  ontology.assert = new Asserter(ontology);
  ontology.classify = new runtime.ontology.classifier.Parser(ontology);
  // ontology.classifier.parser();
  return true;
}

const manifest = {
  type: "domain",
  slug: "learning",
  name: "Learning",
  description: "Domain for learning with units tags ebisu and annotations",
  version: "0.0.2",
};

export { manifest, boot, install, schema, hooks };
