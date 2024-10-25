const manifest = {
  type: "runtime",
  slug: "eng2esp",
  name: "English to Spanish using Universal Dependencies",
};

const modules = {
  domain: "@vivalence/domain/base",
  ontology: "@vivalence/ontology/language",
  corpora: ["@vivalence/corpus/eng-to-esp"],
  strategies: [],
};

const services = {
  llm: "@vivalence/service/litellm",
  nlp: "@vivalence/service/stanza-nlp",
};

const statics = { language: { known: "english", learning: "spanish" } };

export { manifest, modules, services, statics };

// await import("./curricula/0/corpus.viva.js"),
// // database: { slug: "postgres" },
// database: { slug: "supabase" },
// identity: { slug: "supabase" },
