import classifier from "./classifier/index.js";
import remedy from "./methods/remedy/index.js";
// import install from "./methods/install/units.js";

import schema from "./schema/index.js";
import presets from "./presets/index.js";

async function boot(runtime) {
  runtime.router.route("/status", () => ({ status: "ok" }));
  runtime.router.route("/parser/unitFromAnnotation", classifier.unitFromAnnotation);
  runtime.router.route("/parser/annotationsFromText", classifier.annotationsFromText);
  runtime.router.route("/parser/unitsFromText", classifier.unitsFromText);
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
    [[], []]
  );

  // const predictions = await ctx.runtime.methods.predict.tags({ ontologies }, ctx);

  const remedies = [];
  // for (const issue of predictions.issues) {
  // const remedy = await ctx.runtime.methods.remedy({ issue }, ctx);
  // remedies.push(remedy);
  // }

  // i need to do something with the issues and remedies
  // i need to know what was successfully installed, attempted and failed, not even attempted
  // const installed = remedies.
  return { rest, installed: [], failed: [] };
}

export default {
  manifest: {
    type: "Ontology",
    slug: "langugage-universal-dependencies",
    version: "v0.0.0",
    name: "Langauges by Universal Dependencies",
    modules: {
      domain: "file://../domain/domain.viva.js",
      corpus: "file://../corpus/corpus.viva.js",
      games: ["file://../games/flashcards/flashcards.viva.js"],
      strategies: [],
    },
    owner: "Vivalence",
    reference: "https://github.com/vivalence/ontologies/spanish",
    docs: "https://docs.vivalence.com/ontologies/spanish",
  },
  schema,
  boot,
  install,
};
