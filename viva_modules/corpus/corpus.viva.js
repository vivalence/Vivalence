import schema from "./schema/index.js";
import presets from "./presets/index.js";
// import tactics from "./tactics/index.js";
// import strategies from "./strategies/index.js";

// TODO install tactics
async function install(runtime) {
  const { units, tags } = presets(runtime);
  console.log(units.length, units[0]); // 785 { annotation: { pos: "adp", lemma: "a" } }
  console.log(tags.length, tags[0]); // 20 { ontology: { branch: "lemma", leaf: "ser" } }

  // async function installUnits({ units }) {
  //   const [annotations, rest] = units.reduce(
  //     (acc, unit) => (unit.annotation ? acc[0].push(unit.annotation) : acc[1].push(unit)) && acc,
  //     [[], []]
  //   );
  //   const predictions = await ctx.runtime.methods.predict.units({ annotations }, ctx);
  //   const remedies = [];
  //   console.log("install prediction issue ", predictions.issues);
  //   for (const issue of predictions.issues) {
  //     // const remedy = await ctx.runtime.methods.remedy({ issue }, ctx);
  //     // remedies.push(remedy);
  //   }
  //   return { rest: [], installed: [], failed: [] };
  // }
}

// TODO boot strategy hooks
async function boot(runtime) {
  return runtime;
}

export default {
  manifest: {
    type: "Corpus",
    slug: "eng-to-esp",
    name: "English to Spanish",
    modules: {
      ontology: "file://../ontology/ontology.viva.js",
    },
    owner: "Vivalence",
    reference: "https://github.com/vivalence/ontologies/langauge-ud/corpus/eng-to-esp",
    docs: "https://docs.vivalence.com/ontologies/language-ud/corpus/eng-to-esp",
  },
  schema,
  boot,
  install,
};
