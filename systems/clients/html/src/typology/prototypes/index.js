// export * from "./module.js";
export * from "./repository.js";

export class Module {
  // call
  // manifest
  // view
  constructor(module) {
    Object.assign(this, module);
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
