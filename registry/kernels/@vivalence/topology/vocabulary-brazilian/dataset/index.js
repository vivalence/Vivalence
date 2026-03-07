import schema from "./schema.json" with { type: "json" };
import vocabulary from "./vocabulary.js";
import symbol from "./symbol.js";

// import entities from "./entities.json" with { type: "json" };
// import verbs from "./verbs.json" with { type: "json" };

export default {
  schema,
  entities: {
    symbol,
    literal: [...vocabulary],
  },
};
