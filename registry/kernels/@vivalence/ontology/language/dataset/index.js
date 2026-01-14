import schema from "./schema.json" with { type: "json" };
import dimension from "./dimensions/index.js";
// import entities from "./entities.json" with { type: "json" };

// console.log({ dimension });

export default {
  schema,
  entities: { dimension },
};
