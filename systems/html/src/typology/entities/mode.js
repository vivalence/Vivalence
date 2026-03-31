import { Entity } from "../prototypes/entity.js";

export class Mode extends Entity {
  intents = new Set();

  implements(trait) {
    return this.traits?.includes(trait);
  }
}

export const prototype = Mode;
