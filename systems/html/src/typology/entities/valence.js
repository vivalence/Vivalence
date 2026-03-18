import { Entity } from "../prototypes/entity.js";

export class Valence extends Entity {
  implements(trait) {
    return this.traits.includes(trait.toUpperCase());
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      type: this.type,
      traits: this.traits,
      data: this.data,
      mode: this.mode?.slug ?? null,
      queue: this.queue ?? null,
      link: this.link?.nature ?? null,
      hasProducer: typeof this.produce === "function",
    };
  }
}

export const prototype = Valence;

// export class Die extends Wafer {}

// export async function lifecycle(valence) {
//   // (daemon) => async (valence) => {
//   // valence.mode = await daemon.entities.mode.spawn(valence.mode);
// }
