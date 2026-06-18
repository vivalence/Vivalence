import { Entity } from "./entity.js";

export class Intent extends Entity {
  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }
}
