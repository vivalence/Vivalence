import schema from "./schema.json" with { type: "json" };
import entities from "./entities.json" with { type: "json" };
import verbs from "./verbs.json" with { type: "json" };

export default {
  schema,
  entities: { literal: [...entities.literal, ...verbs.literal] },
};
