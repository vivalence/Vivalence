import schema from "./schema.json" with { type: "json" };
import words from "./literals/words/index.js";
import sentences from "./literals/sentences.js";
import conjugation from "./literals/conjugation.js";
import structural from "./symbols/structural.js";
import ontological from "./symbols/ontological.js";

export default {
  schema,
  entities: {
    symbol: [...structural, ...ontological],
    literal: [...words, ...sentences, ...conjugation],
  },
};
