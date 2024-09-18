async function boot(runtime, Module) {
  runtime.router.get("/status", async (ctx) => {
    ctx.response.body = { message: "daemons run this place", status: "ok" };
  });
  return runtime;
}

export default {
  manifest: {
    type: "Runtime",
    slug: "l-ud-eng2esp",
    name: "English to Spanish using Universal Dependencies",
    modules: {
      domain: "file://../viva_modules/domain/domain.viva.js",

      ontology: "file://../viva_modules/ontology/ontology.viva.js",
      corpus: "file://../viva_modules/corpus/corpus.viva.js",
      // ontologies: ["file://../viva_modules/ontology/ontology.viva.js"],
      // corpora: ["file://../viva_modules/corpus/corpus.viva.js"],

      games: [
        "file://../viva_modules/games/flashcards/flashcards.viva.js",
        "file://../viva_modules/games/translations/translations.viva.js",
        "file://../viva_modules/games/conjugations/conjugations.viva.js",
      ],
      tactics: [
        "file://../viva_modules/tactics/applying-verb-conjugations/tactic.viva.js",
        "file://../viva_modules/tactics/article-morphology-of-gender-and-number/tactic.viva.js",
      ],
      strategies: ["file://../viva_modules/strategies/a1.viva.js"],
    },
  },
  boot,
};
