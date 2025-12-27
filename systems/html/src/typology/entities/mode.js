import { Repository, Entity } from "@vivalence/html/typology";

export class Mode {
  // call
  // manifest
  // view
  valences = new Set();
  constructor(mode) {
    Object.assign(this, mode);
  }
  implements(trait) {
    return this.manifest?.traits?.includes(trait);
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
