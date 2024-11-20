const manifest = {
  type: "runtime",
  slug: "eng2esp",
  name: "English to Spanish",
  icon: { emoji: "🇪🇸" },
};

const modules = {
  domain: "@vivalence/domain/base",
  ontology: "@vivalence/ontology/language",
  corpora: [
    "@vivalence/corpus/cefr-eng-to-esp",
    await import("./curricula/0_entry/corpus.viva.js"),
  ],
  strategies: [],
};

const services = {
  llm: "@vivalence/service/llm-litellm",
  nlp: "@vivalence/service/nlp-stanza",
};

const statics = { language: { known: "english", learning: "spanish" } };

export { manifest, modules, services, statics };

// database: { slug: "postgres" },
// database: { slug: "supabase" },
// identity: { slug: "supabase" },
