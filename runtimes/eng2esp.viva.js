import config from "@vivalence/config";

const manifest = {
  type: "runtime",
  slug: "eng2esp",
  name: "English to Spanish",
  icon: { emoji: "🇪🇸" },
  version: "0.0.2",
};

const modules = {
  domain: "@vivalence/domain/base",
  ontology: "@vivalence/ontology/language",
  curricula: ["@vivalence/curriculum/cefr-eng-to-esp"],
};

const services = {
  llm: {
    service: "@vivalence/service/llm-litellm",
    config: {
      keys: {
        openai: config.env.get("OPENAI_API_KEY"),
        groq: config.env.get("GROQ_API_KEY"),
        anthropic: config.env.get("ANTHROPIC_API_KEY"),
      },
    },
  },
  nlp: {
    service: "@vivalence/service/nlp-stanza",
    config: {
      env: {
        url: config.env.get("SERVICE_NLP_URL"),
        port: config.env.get("SERVICE_NLP_PORT"),
        key: config.env.get("SERVICE_NLP_KEY"),
      },
    },
  },
};

const statics = { language: { known: "english", learning: "spanish" } };

export { manifest, modules, services, statics };

// database: { slug: "postgres" },
// database: { slug: "supabase" },
// identity: { slug: "supabase" },
