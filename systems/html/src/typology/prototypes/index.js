export * from "./call/index.js";
export * from "./repository.js";

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

export class Entity {
  constructor(entity) {
    Object.assign(this, entity);
  }
}
