import { Entity } from "@vivalence/html/typology";

export class Mode extends Entity {
  // call
  // manifest
  // view
  valences = new Set();
  implements(trait) {
    return this.manifest?.traits?.includes(trait);
  }

  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      type: this.type,
      traits: this.traits,
      daemon: this.daemon?.slug ?? null,
      mount: this.mount?.nature ?? null,
      valences: [...(this.valences || [])].map((v) => v?.slug ?? v),
      view: this.view ? { Component: !!this.view?.Component, url: this.view?.url ?? null } : null,
      manifest: this.manifest,
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
