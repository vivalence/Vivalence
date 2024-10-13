import classification from "./methods/classification/index.js";
import diagnostics from "./methods/diagnostics/index.js";
import remedy from "./methods/remedy/index.js";
import identity from "./methods/identity/index.js";

import schema from "./schema/index.js";
import installables from "./installables/index.js";

async function boot(runtime) {
  runtime.router.route("/identity/unit", identity.unit);
  runtime.router.route("/identity/tag", identity.tag);

  runtime.router.route("/classification/unitFromAnnotation", classification.unitFromAnnotation);
  runtime.router.route("/classification/annotationsFromText", classification.annotationsFromText);
  runtime.router.route("/classification/unitsFromText", classification.unitsFromText);

  runtime.router.route("/diagnostics/autocomplete/units", diagnostics.autocomplete.units);
  runtime.router.route("/diagnostics/duplicates/annotation", diagnostics.duplicates.annotation);
  runtime.router.route("/diagnostics/predict/tags", diagnostics.predict.tags);
  runtime.router.route("/diagnostics/predict/units", diagnostics.predict.units);

  runtime.router.route("/diagnostics/validate/unit", diagnostics.validate.unit);
  runtime.router.route("/diagnostics/validate/unit/pos", diagnostics.validate.unit.pos);
  runtime.router.route("/diagnostics/validate/unit/schema", diagnostics.validate.unit.schema);
  runtime.router.route("/diagnostics/validate/unit/tags", diagnostics.validate.unit.tags);

  runtime.router.route("/remedy", remedy);

  return runtime;
}

async function install(runtime) {
  const { tags } = await installables(runtime);

  // TODO: parallelize
  for (const tag of tags) {
    const installed = await runtime.call("/tags/install", { tag });
    console.log("ontology tag install:", installed);
  }
  return true;
}

const manifest = {
  type: "Ontology",
  slug: "langugage-universal-dependencies",
  name: "Langauges by Universal Dependencies",
  version: "0.0.3",
};

export { manifest, schema, boot, install };
