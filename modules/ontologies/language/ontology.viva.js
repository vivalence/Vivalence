import schema from "./schema/index.js";
import methods from "./methods/boot.js";
import curriculum from "./curriculum/index.js";

async function boot(runtime) {
  await methods.boot(runtime);
  return runtime;
}

const manifest = {
  type: "ontology",
  slug: "language",
  name: "Langauge after Universal Dependencies",
  version: "0.0.8",
};

export { manifest, schema, boot, curriculum };
