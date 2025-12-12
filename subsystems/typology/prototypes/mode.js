import { Path } from "@vivalence/typology";
import { shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

// base for modes, processes, servics, lets see
// maybe doesnt belong here.
export class Module {
  // type, slug, traits

  constructor(cake) {
    this.cake = cake;
    this.type = cake.manifest.type;
    this.slug = cake.manifest.slug;
    this.traits = cake.manifest.traits || [];
  }

  implements(trait) {
    return this.traits.includes(trait);
  }
}

export class Mode extends Module {
  // status, connection
  // entity: <em.Module>
  // url
  // call

  aperture = new Aperture();
  constructor(cake) {
    super(cake);
  }
}
