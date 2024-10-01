import classification from "./methods/classification/index.js";
import diagnostics from "./methods/diagnostics/index.js";
import remedy from "./methods/remedy/index.js";

import schema from "./schema/index.js";
import installables from "./installables/index.js";

async function boot(runtime) {
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
  const { tags } = installables(runtime);

  const [ontologies, rest] = tags.reduce(
    (acc, tag) => (tag.ontology ? acc[0].push(tag.ontology) : acc[1].push(tag), acc),
    [[], []],
  );

  const issues = await runtime.call("/diagnostics/predict/tags", { ontologies });

  const remedies = [];
  for (const issue of issues) {
    const remedy = await runtime.call("/remedy", { issue });
    remedies.push(remedy);
  }

  return remedies.every((remedy) => remedy.resolved) && rest.length === 0;
}

const manifest = {
  type: "Ontology",
  slug: "langugage-universal-dependencies",
  name: "Langauges by Universal Dependencies",
  version: "0.0.1",
};

export { manifest, schema, boot, install };
