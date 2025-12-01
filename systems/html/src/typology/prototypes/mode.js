export class Mode {
  // call
  // manifest
  // view
  constructor(mode) {
    Object.assign(this, mode);
  }
  implements(trait) {
    return this.manifest?.traits?.includes(trait);
  }
}
