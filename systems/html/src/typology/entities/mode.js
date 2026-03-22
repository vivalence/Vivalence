import { Entity } from "../prototypes/entity.js";

export class Mode extends Entity {
  // call
  // link
  // buffered
  intents = new Set();

  implements(trait) {
    return this.traits?.includes(trait);
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      type: this.type,
      traits: this.traits,
      daemon: this.daemon?.slug ?? null,
      mount: this.mount?.nature ?? null,
      intents: [...(this.intents || [])].map((i) => i?.slug ?? i),
      buffered: this.buffered ? { url: this.buffered.url ?? null } : null,
    };
  }
}

export const prototype = Mode;

// export async function lifecycle(mode) {
//   mode.mount = daemon.mount //
//     .branch(`/mode/${mode.type}/${mode.slug}`);
//   mode.connection = daemon.connection.branch(mode.mount.nature);
//   // console.log("MODE lifecycle", mode);

//   mode.manifest = await mode.connection.call("/manifest");
//   // if (mode.implements("VIEWABLE")) mode.view = await mode.connection.call("/view");
// }

// const entities = {
//   mode: {
//     prototype: Mode,
//   },
//   // symbols, literals
// };
