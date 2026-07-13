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
    "@education/game/flashcard",
    "@education/game/riddler",
    // aprende /drill branches each due literal to one of these by ontology × state:
    // word weak→write strong→judge · sentence weak→shadow strong→listen ·
    // conjugation weak→paradigm strong→conjugation.
    "@education/game/write",
    "@education/game/shadow",
    "@education/game/conjugation",
    "@education/game/judge",
    "@education/game/listen",
    "@education/game/paradigm",
    "@education/game/match",
    "@education/game/pick",
    "@education/game/cloze",
    "@education/game/exhibit",
    "@education/game/nyan",
    "@education/tactic/clinic",
    "@education/tactic/five-fold-session",
    "@education/homepage/aprende",
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
