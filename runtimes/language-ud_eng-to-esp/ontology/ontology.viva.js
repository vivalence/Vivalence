import router from "./router.js";

const manifest = {
  type: "Ontology",
  slug: "langugage-universal-dependencies",
  version: "v0.0.0",
  name: "Langauges by Universal Dependencies",
  games: [
    {
      type: "Game",
      slug: "flashcards"
    }
  ],
  owner: "Vivalence",
  reference: "https://github.com/vivalence/ontologies/spanish",
  docs: "https://docs.vivalence.com/ontologies/spanish"
};

async function boot(runtime, locals) {
  router(runtime);
  console.log("ontology booted");
  return runtime;
}
// runtime.router.use(async (request, state) => {state.ontology = "ontology"; return request;}); runtime.bus.on("@Corpus:loaded", async (ctx) => {console.log("@Ontology @Corpus:loaded event");});

export default {
  manifest,
  boot
};
