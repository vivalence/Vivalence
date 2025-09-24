import { Path } from "@vivalence/typology";
import { Aperture } from "@vivalence/vector/aperture";

// todo: move to daemon
export class Module {
  // url: URL
  // entity: <em.Module>
  // type, slug, traits
  // call

  constructor(register) {
    this.type = register.manifest.type;
    this.slug = register.manifest.slug;
    this.traits = register.manifest.traits || [];
    this.register = register;
    this.aperture = new Aperture()
      .open("/status", async () => ({ code: "SUCCESS" }))
      .open("/manifest", async () => ({ ...this.manifest }));
  }
  implements(trait) {
    return this.traits.includes(trait);
  }
  get manifest() {
    return { ...this.register.manifest };
  }
}
