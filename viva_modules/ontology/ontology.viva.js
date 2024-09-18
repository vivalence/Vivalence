import classification from "./methods/classification/index.js";
import diagnostics from "./methods/diagnostics/index.js";
import remedy from "./methods/remedy/index.js";
import schema from "./schema/index.js";
import presets from "./presets/index.js";

async function boot(runtime) {
  runtime.router.route("/classification/unitFromAnnotation", classification.unitFromAnnotation);
  runtime.router.route("/classification/annotationsFromText", classification.annotationsFromText);
  runtime.router.route("/classification/unitsFromText", classification.unitsFromText);

  runtime.router.route("/diagnostics/autocomplete/units", diagnostics.autocomplete.units);
  runtime.router.route("/diagnostics/duplicates/annotation", diagnostics.duplicates.annotation);
  runtime.router.route("/diagnostics/predict/tags", diagnostics.predict.tags);
  runtime.router.route("/diagnostics/predict/units", diagnostics.predict.units);
  runtime.router.route("/diagnostics/validate/unit", diagnostics.validate.unit);

  runtime.router.route("/remedy", remedy);

  return runtime;
}

async function install(runtime) {
  const { tags } = presets(runtime);

  const [ontologies, rest] = tags.reduce(
    (acc, tag) => {
      tag.ontology ? acc[0].push(tag.ontology) : acc[1].push(tag);
      return acc;
    },
    [[], []],
  );

  const predictions = await runtime.call("/diagnostics/predict/tags", { ontologies });

  const remedies = [];
  for (const issue of predictions.issues) {
    const remedy = await runtime.call("/remedy", { issue });
    remedies.push(remedy);
  }

  // i need to do something with the issues and remedies
  // i need to know what was successfully installed, attempted and failed, not even attempted
  // const installed = remedies.
  return { rest: [], installed: [], failed: [] };
}

export default {
  manifest: {
    type: "Ontology",
    slug: "langugage-universal-dependencies",
    name: "Langauges by Universal Dependencies",
    modules: {
      domain: "file://../domain/domain.viva.js",
    },
    owner: "Vivalence",
    reference: "https://github.com/vivalence/ontologies/spanish",
    docs: "https://docs.vivalence.com/ontologies/spanish",
  },
  schema,
  boot,
  install,
};
