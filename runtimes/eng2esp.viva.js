async function boot(runtime) {
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
      corpus: "file://../viva_modules/corpus/corpus.viva.js",
      ontology: "file://../viva_modules/ontology/ontology.viva.js",
      domain: "file://../viva_modules/domain/domain.viva.js",
      // games: ["file://../viva_modules/games/flashcards/flashcards.viva.js"],
    },
  },
  boot,
};
