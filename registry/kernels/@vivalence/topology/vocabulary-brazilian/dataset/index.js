import schema from "./schema.json" with { type: "json" };

import words from "./literals/words/index.js";
import sentences from "./literals/sentences.js";

import structural from "./symbols/structural.js";

export default {
  schema,
  entities: {
    symbol: [...structural],
    literal: [...words, ...sentences],
  },
};
