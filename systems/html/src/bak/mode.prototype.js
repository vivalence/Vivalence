import { Entity } from "./entity.js";

export class Mode extends Entity {
  intents = new Set();

  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }
}
