import hooks from "./hooks/index.js";
import schema from "./schema/index.js";
import bootHelper from "./boot/index.js";
import installHelper from "./install/index.js";
import events from "./events/index.js";
import aperture from "./aperture/index.js";

function boot(runtime) {
  runtime.modules.tactics = {};
  runtime.modules.games = {};
  // runtime.modules.ontology = {};
  // runtime.modules.corpora = {};
  // runtime.modules.domain = {};

  bootHelper.ontology(runtime);
  bootHelper.corpora(runtime);
  bootHelper.tactics(runtime);
  bootHelper.games(runtime);

  aperture.boot(runtime);
  events.boot(runtime);
}

async function install(module, runtime) {
  if (module.manifest.traits.includes("TOPOLOGICAL")) await installHelper.topology(module, runtime);
  if (module.manifest.traits.includes("CURRICULAR"))
    await installHelper.curriculum(module, runtime);

  return runtime;
}

const manifest = {
  type: "domain",
  slug: "learning",
  name: "Learning",
  description: "Domain for learning with units tags ebisu and annotations",
  version: "0.0.2",
};

export { manifest, boot, install, schema, hooks };
