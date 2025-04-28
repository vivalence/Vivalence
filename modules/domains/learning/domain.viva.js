import hooks from "./hooks/index.js";
import schema from "./schema/index.js";
import bootHelper from "./boot/index.js";
import events from "./events/index.js";
import aperture from "./aperture/index.js";

function boot(runtime) {
  runtime.modules.tactics = {};
  runtime.modules.games = {};

  bootHelper.ontology(runtime);
  bootHelper.corpora(runtime);
  bootHelper.tactics(runtime);
  bootHelper.games(runtime);

  aperture.boot(runtime);
  events.boot(runtime);
}

function install() {
  // runtime.ontology = [
  //   runtime.modules.ontology.topology,
  //   ...runtime.modules.corpora.map((C) => C.topology),
  //   topology.computeSchematics,
  // ].reduce((o, t) => t(o), runtime.ontology);

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
