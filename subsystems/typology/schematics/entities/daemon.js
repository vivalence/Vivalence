import { v } from "../v.js";
import { DataSchematic } from "./base.js";

export const DaemonSchematic = {
  ...DataSchematic,
  $id: "Daemon",
  is: "one installed package running on the runtime: its slug is its id; it owns modes, a dataset of symbols and literals, notes, users",
  own: {
    slug: v.string().desc("its name, the id").examples("education"),
    mask: v.record(v.string(), v.unknown()).optional().desc("the instance mask: module, statics, secrets").examples({ module: "@education/daemon" }),
    traits: v.array(v.string()).optional().desc("the trait names worn").examples([]),
    trait: v.record(v.string(), v.unknown()).optional().desc("trait data by name").examples({}),
  },
  relations: {
    modes: () => v.array(v.mode()).optional().desc("its modes"),
    literals: () => v.array(v.literal()).optional().desc("its literals"),
    symbols: () => v.array(v.symbol()).optional().desc("its symbols"),
    notes: () => v.array(v.note()).optional().desc("notes taken on it"),
    users: () => v.array(v.user()).optional().desc("users who own it"),
  },
  examples: [{ id: "spanish", slug: "spanish", mask: { manifest: { type: "daemon", slug: "spanish", version: "0.0.1", name: "Español", description: "English → Spanish. Aprende is the homepage; dojo, nyan and riddler are live.", icon: { emoji: "🇪🇸" } }, statics: { language: { known: { slug: "english", name: "English" }, learning: { slug: "spanish", name: "Español" } } }, modes: ["@education/domain/language-learning", "@education/topology/word", "@education/topography/english-to-spanish", "@education/homepage/aprende", "@education/game/dojo"], consume: { nlp: { module: "@commons/service/nlp-stanza", secrets: { key: "${SECRET_VIVA_SERVICE_NLP_KEY}" }, statics: { remote: "${VIVA_SERVICE_NLP_REMOTE}", language: "es" } } } }, traits: [], trait: {} }],
};
