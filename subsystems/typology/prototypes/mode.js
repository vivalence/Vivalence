import { Status, Path } from "@vivalence/typology";


// live citizen constructed from a registry module (read.viva result).
export class Mode {
  // connection // entity: <em.Module> // url // view? // call

  status = new Status("<uninitialized>", this);
  aperture = null;

  constructor(module) {
    Object.assign(this, module);
    this.type = this.manifest.type;
    this.slug = this.manifest.slug;
    this.traits = this.manifest.traits || [];
    this.module = module;
  }

  implements(trait) {
    return this.traits.includes(trait.toUpperCase());
  }
}
