async function boot(runtime) {
  runtime.router.route("/status", (body, ctx) => {
    return { status: "ok" };
  });
  return runtime;
}

export default {
  manifest: {
    type: "Runtime",
    slug: "lud-eng2esp",
    name: "English to Spanish using Universal Dependencies",
    modules: {
      corpus: "file://../viva_modules/corpus/corpus.viva.js",
      ontology: "file://../viva_modules/ontology/ontology.viva.js",
      domain: "file://../viva_modules/domain/domain.viva.js",
      games: ["file://../viva_modules/games/flashcards/flashcards.viva.js"],
      strategies: [],
    },
  },
  boot,
};

// corpus: { slug: "eng-to-esp" }, ontology: { slug: "langugage-universal-dependencies" }, domain: { slug: "vivalence-1" }, games: [{ slug: "flashcards" }],

// ontology: "@vivalence/ontologies/langugage-universal-dependencies", domain: "@vivalence/domains/vivalence-1", games: ["@vivalence/games/flashcards"],
