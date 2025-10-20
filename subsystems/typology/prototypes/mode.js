import { Path } from "@vivalence/typology";
import { shards } from "@vivalence/vector";
import { Aperture } from "@vivalence/vector/aperture";

export class Module {
  // status, connection
  // entity: <em.Module>
  // type, slug, traits
  // url
  // call

  constructor(cake) {
    this.type = cake.manifest.type;
    this.slug = cake.manifest.slug;
    this.traits = cake.manifest.traits || [];
    this.cake = cake;
    this.aperture = new Aperture()
      .use(shards.context.attach("mode", this))
      .open("/status", async () => ({ code: "SUCCESS" }))
      .open("/manifest", async () => ({ ...this.cake.manifest }));
  }
  implements(trait) {
    return this.traits.includes(trait);
  }
}

export class Mode extends Module {}
