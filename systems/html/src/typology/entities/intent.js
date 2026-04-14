import { Entity } from "../prototypes/entity.js";

export class Intent extends Entity {
  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }
}

export const IntentDossier = {
  name: "intent",
  kind: () => Intent,
  remote: { endpoint: "/entities/intent" },

  use: [],
};
