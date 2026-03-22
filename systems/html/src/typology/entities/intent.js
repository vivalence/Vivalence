import { Entity } from "../prototypes/entity.js";

export class Intent extends Entity {
  implements(trait) {
    return this.traits.includes(trait.toUpperCase());
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      type: this.type,
      traits: this.traits,
      trait: this.trait,
      mode: this.mode?.slug ?? null,
      link: this.link?.nature ?? null,
    };
  }
}

export const prototype = Intent;
