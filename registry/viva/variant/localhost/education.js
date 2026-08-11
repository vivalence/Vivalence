import paladin from "@vivalence/paladin";
import { Url } from "@vivalence/typology";

export const education = {
  manifest: { type: "daemon", slug: "brazilian", version: "0.0.1" },
  docs: { name: "", valence: "", icon: { emoji: "" } },
  statics: { language: { known: "english", learning: "brazilian" } },
  kernel: [
    "@education/domain/language-learning",
    "@education/topology/word",
    "@education/topology/sentence",
    "@education/topology/conjugation",
    "@education/topography/english-to-brazilian",
    "@education/game/riddler",
    // aprende /drill branches each due literal by ontology × state:
    // word weak→rep-o-gram/write strong→judge · sentence weak→rep-o-gram/shadow
    // strong→rep-o-gram/listen · conjugation weak→paradigm strong→rep-o-gram/conjugations.
    "@education/game/rep-o-gram",
    "@education/game/judge",
    "@education/game/paradigm",
    "@education/game/match",
    "@education/game/cloze",
    "@education/game/exhibit",
    "@education/game/nyan",
    "@education/tactic/clinic",
    "@education/tactic/five-fold-session",
    "@education/teacher/francesca",
    "@education/teacher/dewey",
    "@education/dashboard/dataspace",
  ],
  lighthouse: {
    module: "@viva/lighthouse/multiplayer",
    statics: { remote: () => new Url(paladin.env.get("PUBLIC_VIVA_LIGHTHOUSE_REMOTE")) },
  },
  datamap: {
    module: "@viva/datamap/libsql",
    statics: { db: { file: `test-language.viva.db` } },
  },
  hallucinators: [
    {
      module: "@viva/hallucinator/anthropic",
      statics: {},
      secrets: { key: () => paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
    },
    {
      module: "@viva/hallucinator/openrouter",
      statics: {
        models: {
          fast: { id: "deepseek/deepseek-v4-flash", tune: [0.4, 0.4, 1.0, 1.0], context: 1048576, thinking: false },
        },
      },
      secrets: { key: () => paladin.secret.get("SECRET_VIVA_OPENROUTER_API_KEY") },
    },
    {
      module: "@viva/hallucinator/elevenlabs",
      statics: {},
      secrets: { key: () => paladin.secret.get("SECRET_VIVA_ELEVENLABS_API_KEY") },
    },
    {
      module: "@viva/hallucinator/deepgram",
      statics: {},
      secrets: { key: () => paladin.secret.get("SECRET_VIVA_DEEPGRAM_API_KEY") },
    },
  ],
  consume: {
    nlp: {
      module: "@viva/service/nlp-stanza",
      secrets: { key: () => paladin.secret.get("SECRET_VIVA_SERVICE_NLP_KEY") },
      statics: {
        remote: () => new Url(paladin.env.get("SERVICE_NLP_REMOTE")),
        language: "es",
        processors: "tokenize,mwt,pos,lemma,depparse",
      },
    },
  },
};
