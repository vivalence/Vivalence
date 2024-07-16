const manifest = {
  type: "Corpus",
  slug: "eng-to-esp",
  name: "English to Spanish",
  ontology: { slug: "langugage-universal-dependencies", path: "../ontology/ontology.viva.js" },
  owner: "Vivalence",
  reference: "https://github.com/vivalence/ontologies/langauge-ud/corpus/eng-to-esp",
  docs: "https://docs.vivalence.com/ontologies/language-ud/corpus/eng-to-esp"
};

async function boot(runtime, locals) {
  // runtime.router.use(async (request, state) => {state.corpus = "corpus"; return request;}); runtime.router.route("/instructions", async (request, state) => {console.log("corpus route /instructions"); return [{ type: "instruction", strategy: state.strategy }];});
  // runtime.bus.emit("loaded", null);
  return runtime;
}

// async function activate() {console.log();}

export default {
  manifest,
  boot
  // activate
};
