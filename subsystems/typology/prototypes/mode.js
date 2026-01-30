import { Status, Path } from "@vivalence/typology";
import { shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

// all runtime instances of types from the registry
// base for instantiations such as modes and service or process providers.
// anything received from the registry.

export class Cake {
  // type, slug, traits

  constructor(cake) {
    Object.assign(this, cake);
    this.type = this.manifest.type;
    this.slug = this.manifest.slug;
    this.traits = this.manifest.traits || [];
    //
    this.cake = cake; // legacy
  }

  implements(trait) {
    return this.traits.includes(trait.toUpperCase());
  }
}

export class Mode extends Cake {
  // connection // entity: <em.Module> // url // view? // call

  status = new Status("<uninitialized>", this);
  aperture = new Aperture();

  constructor(cake) {
    super(cake);
  }
}
